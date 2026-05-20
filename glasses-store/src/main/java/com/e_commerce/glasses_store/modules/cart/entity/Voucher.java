package com.e_commerce.glasses_store.modules.cart.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Voucher khuyến mãi.
 * Maps to Flyway V7 + V12: vouchers table.
 */
@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision = 19, scale = 4)
    private BigDecimal maxDiscountAmount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "per_user_limit")
    private Integer perUserLimit;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicable_to", nullable = false, length = 20)
    @Builder.Default
    private ApplicableTo applicableTo = ApplicableTo.ALL;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VoucherApplicableItem> applicableItems = new ArrayList<>();

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL)
    @Builder.Default
    private List<VoucherUsage> usages = new ArrayList<>();

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }

    public enum ApplicableTo {
        ALL, CATEGORY, PRODUCT
    }

    // ==================== Business Methods ====================

    /**
     * Kiểm tra voucher có hợp lệ để sử dụng hay không (global check).
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive
                && now.isAfter(startDate) && now.isBefore(endDate)
                && (usageLimit == null || usedCount < usageLimit);
    }

    /**
     * Tính tiền giảm giá.
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        BigDecimal minAmount = (minOrderAmount != null) ? minOrderAmount : BigDecimal.ZERO;
        if (orderAmount.compareTo(minAmount) < 0)
            return BigDecimal.ZERO;

        BigDecimal discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                discount = maxDiscountAmount;
            }
        } else {
            discount = discountValue;
        }
        return discount.min(orderAmount); // Không giảm quá tổng đơn
    }
}
