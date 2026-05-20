package com.e_commerce.glasses_store.modules.payment.service;

import com.e_commerce.glasses_store.config.PayOsConfig;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Service xử lý thanh toán qua PayOS (VietQR).
 * SDK v2.0.1 — docs: https://github.com/payOSHQ/payos-lib-java
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsService {

    private final PayOS payOS;
    private final PayOsConfig payOsConfig;

    /**
     * Tạo link thanh toán PayOS từ đơn hàng.
     * Trả về checkoutUrl để redirect người dùng quét QR.
     *
     * @param order đơn hàng cần thanh toán
     * @return checkoutUrl (trang QR của PayOS)
     */
    public String createPaymentLink(Order order) {
        try {
            // PayOS yêu cầu orderCode phải là số nguyên (long), unique
            long orderCode = Math.abs((long) order.getCode().hashCode());

            // Số tiền VND (số nguyên, không thập phân)
            long amount = order.getFinalAmount().longValue();

            // Mô tả tối đa 25 ký tự (yêu cầu PayOS)
            String description = "Thanh toan " + order.getCode();
            if (description.length() > 25) {
                description = description.substring(0, 25);
            }

            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .returnUrl(payOsConfig.getReturnUrl()
                            + "?orderCode=" + orderCode
                            + "&internalCode=" + order.getCode())
                    .cancelUrl(payOsConfig.getCancelUrl()
                            + "?orderCode=" + orderCode
                            + "&internalCode=" + order.getCode())
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentData);

            // Lưu orderCode PayOS vào gatewayTxnRef để tra cứu webhook sau
            order.setGatewayTxnRef(String.valueOf(orderCode));

            log.info("PayOS payment link created: orderCode={}, checkoutUrl={}",
                    orderCode, response.getCheckoutUrl());
            return response.getCheckoutUrl();

        } catch (Exception e) {
            log.error("PayOS createPaymentLink error for order {}: {}", order.getCode(), e.getMessage(), e);
            throw new RuntimeException("Không thể tạo link thanh toán PayOS: " + e.getMessage(), e);
        }
    }

    /**
     * Xác thực webhook data từ PayOS.
     * SDK tự động verify chữ ký HMAC-SHA256.
     *
     * @param webhookBody raw body từ request PayOS gửi đến
     * @return WebhookData đã được xác thực
     */
    public WebhookData verifyWebhookData(ObjectNode webhookBody) {
        try {
            return payOS.webhooks().verify(webhookBody);
        } catch (Exception e) {
            log.error("PayOS webhook verification error: {}", e.getMessage(), e);
            throw new RuntimeException("Xác thực webhook PayOS thất bại: " + e.getMessage(), e);
        }
    }
}
