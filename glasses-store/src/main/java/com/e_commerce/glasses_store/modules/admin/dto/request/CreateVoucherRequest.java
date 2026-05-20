package com.e_commerce.glasses_store.modules.admin.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVoucherRequest {

    @NotBlank(message = "Voucher code is required")
    @Size(max = 50, message = "Voucher code must be at most 50 characters")
    private String code;

    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;

    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;

    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private Integer perUserLimit;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private String applicableTo = "ALL"; // ALL, CATEGORY, PRODUCT

    private List<String> applicableItemIds;
}
