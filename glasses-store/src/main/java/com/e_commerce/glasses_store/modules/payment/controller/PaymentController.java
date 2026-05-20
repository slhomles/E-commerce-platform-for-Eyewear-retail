package com.e_commerce.glasses_store.modules.payment.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.payment.service.MoMoService;
import com.e_commerce.glasses_store.modules.payment.service.PayOsService;
import com.e_commerce.glasses_store.modules.payment.service.VnpayService;
import com.e_commerce.glasses_store.modules.payment.service.ZaloPayService;
import vn.payos.model.webhooks.WebhookData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VnpayService vnpayService;
    private final ZaloPayService zaloPayService;
    private final MoMoService moMoService;
    private final PayOsService payOsService;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== VNPay ====================

    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<String>> vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("VNPay Callback Params: {}", params);

        boolean isValid = vnpayService.verifyPayment(params);
        if (isValid) {
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String orderCode = params.get("vnp_TxnRef");

            Optional<Order> orderOpt = orderRepository.findByCode(orderCode);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if ("00".equals(vnp_ResponseCode)) {
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    order.setStatus(Order.OrderStatus.PAID);
                    orderRepository.save(order);
                    return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công"));
                } else {
                    return ResponseEntity.ok(ApiResponse.error(400, "Thanh toán thất bại, mã lỗi: " + vnp_ResponseCode));
                }
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy đơn hàng"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "Xác thực chữ ký thất bại"));
    }

    // ==================== ZaloPay ====================

    /**
     * ZaloPay IPN: ZaloPay POSTs JSON {"data": "...", "mac": "...", "type": 1}.
     * Response format must be {"return_code": 1, "return_message": "success"}.
     */
    @PostMapping("/zalopay-callback")
    public ResponseEntity<Map<String, Object>> zaloPayCallback(@RequestBody Map<String, String> body) {
        log.info("ZaloPay IPN body: {}", body);
        Map<String, Object> resp = new HashMap<>();
        try {
            String dataStr = body.get("data");
            String reqMac = body.get("mac");
            if (!zaloPayService.verifyCallback(dataStr, reqMac)) {
                resp.put("return_code", -1);
                resp.put("return_message", "mac not equal");
                return ResponseEntity.ok(resp);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(dataStr, Map.class);
            String appTransId = String.valueOf(data.get("app_trans_id"));

            Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(appTransId);
            if (orderOpt.isEmpty()) {
                log.warn("ZaloPay IPN: order not found for app_trans_id={}", appTransId);
                resp.put("return_code", 0);
                resp.put("return_message", "order not found");
                return ResponseEntity.ok(resp);
            }
            Order order = orderOpt.get();
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);

            resp.put("return_code", 1);
            resp.put("return_message", "success");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("ZaloPay IPN error: {}", e.getMessage(), e);
            resp.put("return_code", 0);
            resp.put("return_message", e.getMessage());
            return ResponseEntity.ok(resp);
        }
    }

    /**
     * User redirect endpoint — frontend calls this after ZaloPay redirects back.
     * Returns whether the order has been marked PAID by the IPN.
     */
    @GetMapping("/zalopay-return")
    public ResponseEntity<ApiResponse<String>> zaloPayReturn(@RequestParam Map<String, String> params) {
        log.info("ZaloPay Return Params: {}", params);
        String appTransId = params.get("apptransid");
        String status = params.get("status");

        if (appTransId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Missing apptransid"));
        }
        Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(appTransId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy đơn hàng"));
        }
        Order order = orderOpt.get();

        // Trust IPN-driven state. The redirect status is informational only.
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công"));
        }
        if ("1".equals(status)) {
            // ZaloPay reports success but IPN may not have arrived yet; show pending.
            return ResponseEntity.ok(ApiResponse.success("Đang xác nhận thanh toán, vui lòng đợi..."));
        }
        return ResponseEntity.ok(ApiResponse.error(400, "Thanh toán không thành công hoặc đã hủy"));
    }

    // ==================== MoMo ====================

    /**
     * MoMo IPN: POST JSON body with `signature`. Verify and update order.
     * MoMo expects 204 No Content on success.
     */
    @PostMapping("/momo-ipn")
    public ResponseEntity<Void> moMoIpn(@RequestBody Map<String, Object> body) {
        log.info("MoMo IPN body: {}", body);
        try {
            if (!moMoService.verifyIpn(body)) {
                log.warn("MoMo IPN: signature mismatch");
                return ResponseEntity.badRequest().build();
            }

            Integer resultCode = body.get("resultCode") == null ? null : ((Number) body.get("resultCode")).intValue();
            String momoOrderId = String.valueOf(body.get("orderId"));

            Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(momoOrderId);
            if (orderOpt.isEmpty()) {
                log.warn("MoMo IPN: order not found for orderId={}", momoOrderId);
                return ResponseEntity.noContent().build();
            }
            Order order = orderOpt.get();
            if (resultCode != null && resultCode == 0) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.OrderStatus.PAID);
                orderRepository.save(order);
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("MoMo IPN error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * User redirect endpoint — frontend calls this after MoMo redirects back.
     */
    @GetMapping("/momo-return")
    public ResponseEntity<ApiResponse<String>> moMoReturn(@RequestParam Map<String, String> params) {
        log.info("MoMo Return Params: {}", params);
        String momoOrderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        if (momoOrderId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Missing orderId"));
        }

        Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(momoOrderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy đơn hàng"));
        }
        Order order = orderOpt.get();

        // Best-effort: if IPN hasn't arrived but MoMo returned resultCode=0 on redirect, optimistically
        // mark PAID; the IPN remains the source of truth and will reconfirm.
        if ("0".equals(resultCode) && order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);
        }

        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công"));
        }
        return ResponseEntity.ok(ApiResponse.error(400, "Thanh toán không thành công hoặc đã hủy (mã: " + resultCode + ")"));
    }

    // ==================== PayOS ====================

    /**
     * PayOS Webhook (IPN): PayOS POSTs JSON với signature.
     * Xác thực chữ ký → cập nhật order PAID.
     * Trả về {"code": "00", "desc": "success"} khi thành công.
     */
    @PostMapping("/payos-webhook")
    public ResponseEntity<Map<String, Object>> payOsWebhook(@RequestBody Map<String, Object> body) {
        log.info("PayOS Webhook body: {}", body);
        Map<String, Object> resp = new HashMap<>();
        try {
            WebhookData webhookData = payOsService.verifyWebhookData(body);

            String orderCodeStr = String.valueOf(webhookData.getOrderCode());
            Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(orderCodeStr);

            if (orderOpt.isEmpty()) {
                log.warn("PayOS Webhook: order not found for orderCode={}", orderCodeStr);
                resp.put("code", "00");
                resp.put("desc", "success");
                return ResponseEntity.ok(resp);
            }

            Order order = orderOpt.get();
            // PayOS trả code "00" nghĩa là thanh toán thành công
            if ("00".equals(webhookData.getCode())) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.OrderStatus.PAID);
                orderRepository.save(order);
                log.info("PayOS: order {} marked as PAID", order.getCode());
            }

            resp.put("code", "00");
            resp.put("desc", "success");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            log.error("PayOS Webhook error: {}", e.getMessage(), e);
            resp.put("code", "01");
            resp.put("desc", e.getMessage());
            return ResponseEntity.ok(resp);
        }
    }

    /**
     * User redirect sau khi thanh toán PayOS.
     * Frontend gọi endpoint này sau khi PayOS redirect về.
     */
    @GetMapping("/payos-return")
    public ResponseEntity<ApiResponse<String>> payOsReturn(@RequestParam Map<String, String> params) {
        log.info("PayOS Return Params: {}", params);
        String orderCodeStr = params.get("orderCode");
        String code = params.get("code");

        if (orderCodeStr == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Missing orderCode"));
        }

        // Tìm đơn hàng theo gatewayTxnRef (= orderCode PayOS)
        Optional<Order> orderOpt = orderRepository.findByGatewayTxnRef(orderCodeStr);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy đơn hàng"));
        }

        Order order = orderOpt.get();

        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công"));
        }

        if ("00".equals(code)) {
            // Webhook có thể chưa tới, mark paid tạm
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);
            return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công"));
        }

        return ResponseEntity.ok(ApiResponse.error(400, "Thanh toán không thành công hoặc đã hủy"));
    }
}
