package com.e_commerce.glasses_store.modules.cart.repository;

import com.e_commerce.glasses_store.modules.cart.entity.Voucher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * JPA Specification builder cho dynamic voucher filtering.
 */
public final class VoucherSpecification {

    private VoucherSpecification() {
    }

    /**
     * Tìm kiếm theo mã hoặc mô tả voucher (LIKE).
     */
    public static Specification<Voucher> hasKeyword(String keyword) {
        if (!StringUtils.hasText(keyword))
            return (root, query, cb) -> cb.conjunction();
        String pattern = "%" + keyword.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("code")), pattern),
                cb.like(cb.lower(root.get("description")), pattern));
    }

    /**
     * Lọc theo loại giảm giá.
     */
    public static Specification<Voucher> hasDiscountType(String discountType) {
        if (!StringUtils.hasText(discountType))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.equal(root.get("discountType"),
                Voucher.DiscountType.valueOf(discountType.toUpperCase()));
    }

    /**
     * Lọc theo trạng thái tính toán: ACTIVE, INACTIVE, EXPIRED, UPCOMING, DEPLETED.
     */
    public static Specification<Voucher> hasStatus(String status) {
        if (!StringUtils.hasText(status))
            return (root, query, cb) -> cb.conjunction();

        LocalDateTime now = LocalDateTime.now();

        return switch (status.toUpperCase()) {
            case "INACTIVE" -> (root, query, cb) -> cb.equal(root.get("isActive"), false);
            case "EXPIRED" -> (root, query, cb) -> cb.and(
                    cb.equal(root.get("isActive"), true),
                    cb.lessThan(root.get("endDate"), now));
            case "UPCOMING" -> (root, query, cb) -> cb.and(
                    cb.equal(root.get("isActive"), true),
                    cb.greaterThan(root.get("startDate"), now));
            case "DEPLETED" -> (root, query, cb) -> cb.and(
                    cb.equal(root.get("isActive"), true),
                    cb.greaterThanOrEqualTo(root.get("startDate"), now).not(),
                    cb.lessThan(root.get("endDate"), now).not(),
                    cb.isNotNull(root.get("usageLimit")),
                    cb.greaterThanOrEqualTo(root.get("usedCount"), root.get("usageLimit")));
            case "ACTIVE" -> (root, query, cb) -> {
                var isActive = cb.equal(root.get("isActive"), true);
                var inDateRange = cb.and(
                        cb.lessThanOrEqualTo(root.get("startDate"), now),
                        cb.greaterThanOrEqualTo(root.get("endDate"), now));
                var notDepleted = cb.or(
                        cb.isNull(root.get("usageLimit")),
                        cb.lessThan(root.get("usedCount"), root.get("usageLimit")));
                return cb.and(isActive, inDateRange, notDepleted);
            };
            default -> (root, query, cb) -> cb.conjunction();
        };
    }
}
