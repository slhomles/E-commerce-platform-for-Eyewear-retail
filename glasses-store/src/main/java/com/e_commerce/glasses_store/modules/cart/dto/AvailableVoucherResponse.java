package com.e_commerce.glasses_store.modules.cart.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AvailableVoucherResponse(
        String id,
        String code,
        String description,
        String discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        BigDecimal estimatedDiscountAmount,
        LocalDateTime endDate
) {
}
