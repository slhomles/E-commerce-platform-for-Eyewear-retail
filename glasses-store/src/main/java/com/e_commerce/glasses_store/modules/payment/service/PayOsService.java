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
 * Service for PayOS (VietQR) payments.
 * SDK v2.0.1 - docs: https://github.com/payOSHQ/payos-lib-java
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsService {

    private final PayOS payOS;
    private final PayOsConfig payOsConfig;

    /**
     * Create a PayOS payment link from an order.
     * Returns checkoutUrl so the user can scan the QR code.
     *
     * @param order order to pay
     * @return checkoutUrl (PayOS QR page)
     */
    public String createPaymentLink(Order order) {
        try {
            // PayOS requires orderCode to be a unique integer (long).
            long orderCode = Math.abs((long) order.getCode().hashCode());

            // VND amount as an integer.
            long amount = order.getFinalAmount().longValue();

            // PayOS requires description to be at most 25 characters.
            String description = "Payment " + order.getCode();
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

            // Store PayOS orderCode in gatewayTxnRef for webhook lookup.
            order.setGatewayTxnRef(String.valueOf(orderCode));

            log.info("PayOS payment link created: orderCode={}, checkoutUrl={}",
                    orderCode, response.getCheckoutUrl());
            return response.getCheckoutUrl();

        } catch (Exception e) {
            log.error("PayOS createPaymentLink error for order {}: {}", order.getCode(), e.getMessage(), e);
            throw new RuntimeException("Cannot create PayOS payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Verify webhook data from PayOS.
     * The SDK verifies the HMAC-SHA256 signature.
     *
     * @param webhookBody raw body sent by PayOS
     * @return verified WebhookData
     */
    public WebhookData verifyWebhookData(ObjectNode webhookBody) {
        try {
            return payOS.webhooks().verify(webhookBody);
        } catch (Exception e) {
            log.error("PayOS webhook verification error: {}", e.getMessage(), e);
            throw new RuntimeException("PayOS webhook verification failed: " + e.getMessage(), e);
        }
    }
}
