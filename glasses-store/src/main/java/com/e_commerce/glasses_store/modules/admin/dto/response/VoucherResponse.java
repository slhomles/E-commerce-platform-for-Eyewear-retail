package com.e_commerce.glasses_store.modules.admin.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {

    private String id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer perUserLimit;
    private String applicableTo;
    private List<ApplicableItemResponse> applicableItems;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private String status; // Computed: ACTIVE, INACTIVE, EXPIRED, UPCOMING, DEPLETED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicableItemResponse {
        private String itemId;
        private String itemType;
        private String itemName;
    }
}
