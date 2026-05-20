package com.e_commerce.glasses_store.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;
import vn.payos.core.ClientOptions;

/**
 * Cấu hình PayOS — tích hợp thanh toán VietQR.
 * Thông tin lấy từ dashboard: my.payos.vn
 * SDK v2.0.1 — docs: https://github.com/payOSHQ/payos-lib-java
 */
@Configuration
@Getter
public class PayOsConfig {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    @Bean
    public PayOS payOS() {
        return new PayOS(
                ClientOptions.builder()
                        .clientId(clientId)
                        .apiKey(apiKey)
                        .checksumKey(checksumKey)
                        .build()
        );
    }
}
