package com.e_commerce.glasses_store.modules.admin.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherStatsResponse {

    private long totalVouchers;
    private long activeVouchers;
    private long expiredVouchers;
    private long totalUsages;
    private BigDecimal totalDiscountGiven;
}
