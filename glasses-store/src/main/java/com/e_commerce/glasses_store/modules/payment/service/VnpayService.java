package com.e_commerce.glasses_store.modules.payment.service;

import com.e_commerce.glasses_store.config.VnpayConfig;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class VnpayService {

    private final VnpayConfig vnpayConfig;

    public String createPaymentUrl(Order order, HttpServletRequest request) {
        String vnp_Version = vnpayConfig.getVersion();
        String vnp_Command = vnpayConfig.getCommand();
        String vnp_TxnRef = order.getCode();
        String vnp_IpAddr = getIpAddress(request);
        String vnp_TmnCode = vnpayConfig.getTmnCode();

        long amount = order.getFinalAmount().multiply(new java.math.BigDecimal(100)).longValue();
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // if (order.getVnpaySubMethod() != null) {
        //     String subMethod = order.getVnpaySubMethod();
        //     if ("vnpay_visa".equals(subMethod)) {
        //         vnp_Params.put("vnp_BankCode", "VISA");
        //     } else if ("vnpay_wallet".equals(subMethod)) {
        //         vnp_Params.put("vnp_BankCode", "VNPAYQR");
        //     } else if ("vnpay_banking".equals(subMethod)) {
        //         vnp_Params.put("vnp_BankCode", "NCB");
        //     }
        // }

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (java.io.UnsupportedEncodingException e) {
                    log.error("Encoding error", e);
                }
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString().replace("+", "%20");
        log.debug("VNPay Hash Data String: [{}]", hashData.toString());
        String vnp_SecureHash = VnpayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String finalUrl = vnpayConfig.getVnpayUrl() + "?" + queryUrl;
        log.info("Generated VNPay Payment URL: {}", finalUrl);
        return finalUrl;
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress != null && ipAddress.equals("0:0:0:0:0:0:0:1")) {
            ipAddress = "127.0.0.1";
        }
        return ipAddress;
    }

    public boolean verifyPayment(Map<String, String> fields) {
        String vnp_SecureHash = fields.get("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Sort fields and build hash string
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    sb.append(fieldName);
                    sb.append("=");
                    sb.append(java.net.URLEncoder.encode(fieldValue, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (java.io.UnsupportedEncodingException e) {
                    log.error("Encoding error", e);
                }
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        
        String signValue = VnpayConfig.hmacSHA512(vnpayConfig.getHashSecret(), sb.toString());
        return signValue.equals(vnp_SecureHash);
    }
}
