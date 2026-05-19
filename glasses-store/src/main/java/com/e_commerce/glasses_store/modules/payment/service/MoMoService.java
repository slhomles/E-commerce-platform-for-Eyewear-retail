package com.e_commerce.glasses_store.modules.payment.service;

import com.e_commerce.glasses_store.config.MoMoConfig;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoService {

    private final MoMoConfig moMoConfig;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create a MoMo sandbox payment and return payUrl for frontend redirect.
     * MoMo requires the orderId to be unique per transaction — we append a UUID suffix.
     */
    public String createPaymentUrl(Order order) {
        String requestId = UUID.randomUUID().toString();
        // Append short UUID suffix so the orderId stays unique even if the same Order is retried.
        String momoOrderId = order.getCode() + "-" + requestId.substring(0, 8);
        long amount = order.getFinalAmount().longValue();
        String orderInfo = "Thanh toan don hang #" + order.getCode();
        String extraData = "";

        String rawSignature = "accessKey=" + moMoConfig.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + moMoConfig.getIpnUrl()
                + "&orderId=" + momoOrderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + moMoConfig.getPartnerCode()
                + "&redirectUrl=" + moMoConfig.getRedirectUrl()
                + "&requestId=" + requestId
                + "&requestType=" + moMoConfig.getRequestType();

        String signature = MoMoConfig.hmacSHA256(moMoConfig.getSecretKey(), rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", moMoConfig.getPartnerCode());
        body.put("accessKey", moMoConfig.getAccessKey());
        body.put("requestId", requestId);
        body.put("amount", String.valueOf(amount));
        body.put("orderId", momoOrderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", moMoConfig.getRedirectUrl());
        body.put("ipnUrl", moMoConfig.getIpnUrl());
        body.put("extraData", extraData);
        body.put("requestType", moMoConfig.getRequestType());
        body.put("signature", signature);
        body.put("lang", "vi");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    moMoConfig.getEndpoint(), request, Map.class);
            log.info("MoMo create-order response for {}: {}", order.getCode(), response);

            if (response == null) {
                throw new IllegalStateException("MoMo returned empty response");
            }
            Object resultCode = response.get("resultCode");
            Object payUrl = response.get("payUrl");
            if (resultCode == null || ((Number) resultCode).intValue() != 0 || payUrl == null) {
                String msg = String.valueOf(response.get("message"));
                throw new IllegalStateException("MoMo create-order failed: " + msg);
            }

            order.setGatewayTxnRef(momoOrderId);
            orderRepository.save(order);

            return String.valueOf(payUrl);
        } catch (Exception e) {
            log.error("MoMo createPaymentUrl error for order {}: {}", order.getCode(), e.getMessage(), e);
            throw new IllegalStateException("Không thể tạo giao dịch MoMo: " + e.getMessage(), e);
        }
    }

    /**
     * Verify MoMo IPN by rebuilding the canonical signature string (alphabetical order
     * of allowed fields) and comparing with the provided `signature`.
     * Canonical key order per MoMo IPN spec:
     * accessKey, amount, extraData, message, orderId, orderInfo, orderType,
     * partnerCode, payType, requestId, responseTime, resultCode, transId
     */
    public boolean verifyIpn(Map<String, Object> body) {
        if (body == null || !body.containsKey("signature")) return false;
        String providedSig = String.valueOf(body.get("signature"));

        String raw = "accessKey=" + moMoConfig.getAccessKey()
                + "&amount=" + str(body.get("amount"))
                + "&extraData=" + str(body.get("extraData"))
                + "&message=" + str(body.get("message"))
                + "&orderId=" + str(body.get("orderId"))
                + "&orderInfo=" + str(body.get("orderInfo"))
                + "&orderType=" + str(body.get("orderType"))
                + "&partnerCode=" + str(body.get("partnerCode"))
                + "&payType=" + str(body.get("payType"))
                + "&requestId=" + str(body.get("requestId"))
                + "&responseTime=" + str(body.get("responseTime"))
                + "&resultCode=" + str(body.get("resultCode"))
                + "&transId=" + str(body.get("transId"));

        String computed = MoMoConfig.hmacSHA256(moMoConfig.getSecretKey(), raw);
        return constantTimeEquals(computed, providedSig);
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) result |= a.charAt(i) ^ b.charAt(i);
        return result == 0;
    }
}
