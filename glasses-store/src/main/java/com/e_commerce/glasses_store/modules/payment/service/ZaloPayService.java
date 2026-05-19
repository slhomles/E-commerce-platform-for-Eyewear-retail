package com.e_commerce.glasses_store.modules.payment.service;

import com.e_commerce.glasses_store.config.ZaloPayConfig;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZaloPayService {

    private final ZaloPayConfig zaloPayConfig;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create a ZaloPay sandbox order and return the order_url for frontend redirect.
     * Persists app_trans_id on order.gatewayTxnRef so we can reconcile when ZaloPay calls back.
     */
    public String createPaymentUrl(Order order) {
        String appTransId = buildAppTransId(order.getCode());
        long appTime = System.currentTimeMillis();
        long amount = order.getFinalAmount().longValue();
        String appUser = order.getUserId() != null ? order.getUserId() : "guest";
        String description = "Thanh toan don hang #" + order.getCode();
        String item = "[]";

        Map<String, Object> embed = new HashMap<>();
        embed.put("redirecturl", zaloPayConfig.getRedirectUrl());
        String embedData;
        try {
            embedData = objectMapper.writeValueAsString(embed);
        } catch (Exception e) {
            embedData = "{}";
        }

        String macInput = String.join("|",
                zaloPayConfig.getAppId(),
                appTransId,
                appUser,
                String.valueOf(amount),
                String.valueOf(appTime),
                embedData,
                item
        );
        String mac = ZaloPayConfig.hmacSHA256(zaloPayConfig.getKey1(), macInput);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("app_id", zaloPayConfig.getAppId());
        body.add("app_trans_id", appTransId);
        body.add("app_user", appUser);
        body.add("app_time", String.valueOf(appTime));
        body.add("amount", String.valueOf(amount));
        body.add("item", item);
        body.add("embed_data", embedData);
        body.add("description", description);
        body.add("bank_code", "");
        body.add("callback_url", zaloPayConfig.getCallbackUrl());
        body.add("mac", mac);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    zaloPayConfig.getEndpoint(), request, Map.class);
            log.info("ZaloPay create-order response for {}: {}", order.getCode(), response);

            if (response == null) {
                throw new IllegalStateException("ZaloPay returned empty response");
            }
            Object returnCode = response.get("return_code");
            Object orderUrl = response.get("order_url");
            if (returnCode == null || !"1".equals(String.valueOf(returnCode)) || orderUrl == null) {
                String msg = String.valueOf(response.get("return_message"));
                throw new IllegalStateException("ZaloPay create-order failed: " + msg);
            }

            order.setGatewayTxnRef(appTransId);
            orderRepository.save(order);

            return String.valueOf(orderUrl);
        } catch (Exception e) {
            log.error("ZaloPay createPaymentUrl error for order {}: {}", order.getCode(), e.getMessage(), e);
            throw new IllegalStateException("Không thể tạo giao dịch ZaloPay: " + e.getMessage(), e);
        }
    }

    /**
     * Verify the ZaloPay IPN callback by recomputing HMAC of the raw `data` string with key2.
     */
    public boolean verifyCallback(String dataStr, String reqMac) {
        if (dataStr == null || reqMac == null) return false;
        String computed = ZaloPayConfig.hmacSHA256(zaloPayConfig.getKey2(), dataStr);
        return constantTimeEquals(computed, reqMac);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) result |= a.charAt(i) ^ b.charAt(i);
        return result == 0;
    }

    private String buildAppTransId(String orderCode) {
        String datePrefix = new SimpleDateFormat("yyMMdd").format(new Date());
        int rand = ThreadLocalRandom.current().nextInt(100000, 999999);
        return datePrefix + "_" + orderCode + "_" + rand;
    }
}
