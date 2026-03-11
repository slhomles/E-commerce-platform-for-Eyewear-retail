package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.Order;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Specification builder cho dynamic order filtering.
 * Mỗi method trả Specification để chain:
 * Specification.where(hasUser).and(hasStatus).and(createdBetween)...
 */
public final class OrderSpecification {

    private OrderSpecification() {
    }

    /**
     * Lọc theo userId — dùng cho user xem đơn hàng của mình.
     */
    public static Specification<Order> hasUser(String userId) {
        if (!StringUtils.hasText(userId))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    /**
     * Lọc theo trạng thái đơn hàng.
     */
    public static Specification<Order> hasStatus(String status) {
        if (!StringUtils.hasText(status))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.equal(root.get("status"),
                Order.OrderStatus.valueOf(status.toUpperCase()));
    }

    /**
     * Lọc theo trạng thái thanh toán.
     */
    public static Specification<Order> hasPaymentStatus(String paymentStatus) {
        if (!StringUtils.hasText(paymentStatus))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.equal(root.get("paymentStatus"),
                Order.PaymentStatus.valueOf(paymentStatus.toUpperCase()));
    }

    /**
     * Lọc theo khoảng thời gian tạo đơn.
     */
    public static Specification<Order> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            } else if (to != null) {
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            }
            return cb.conjunction();
        };
    }

    /**
     * Tìm kiếm theo mã đơn hàng (LIKE).
     */
    public static Specification<Order> hasKeyword(String keyword) {
        if (!StringUtils.hasText(keyword))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.like(
                cb.lower(root.get("code")),
                "%" + keyword.toLowerCase() + "%");
    }

    /**
     * Lọc theo khoảng tiền finalAmount.
     */
    public static Specification<Order> amountBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min != null && max != null) {
                return cb.between(root.get("finalAmount"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("finalAmount"), min);
            } else if (max != null) {
                return cb.lessThanOrEqualTo(root.get("finalAmount"), max);
            }
            return cb.conjunction();
        };
    }

    /**
     * Lọc theo phương thức thanh toán.
     */
    public static Specification<Order> hasPaymentMethod(String paymentMethod) {
        if (!StringUtils.hasText(paymentMethod))
            return (root, query, cb) -> cb.conjunction();
        return (root, query, cb) -> cb.equal(root.get("paymentMethod"),
                Order.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
    }
}
