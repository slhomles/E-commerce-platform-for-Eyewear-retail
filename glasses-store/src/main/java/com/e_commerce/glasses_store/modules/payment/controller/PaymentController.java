package com.e_commerce.glasses_store.modules.payment.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.payment.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VnpayService vnpayService;
    private final OrderRepository orderRepository;

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
}
