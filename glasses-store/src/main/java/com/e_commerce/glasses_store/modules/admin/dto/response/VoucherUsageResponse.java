package com.e_commerce.glasses_store.modules.admin.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherUsageResponse {

    private String id;
    private String userId;
    private String userFullName;
    private String userEmail;
    private String orderId;
    private String orderCode;
    private LocalDateTime usedAt;
}
