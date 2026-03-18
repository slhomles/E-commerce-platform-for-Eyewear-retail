package com.e_commerce.glasses_store.modules.order.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Đơn hàng — entity chính.
 * Maps to Flyway V5: orders table.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_user", columnList = "user_id"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "code", nullable = false, length = 20, unique = true)
    private String code;

    @Column(name = "user_id")
    private String userId;

    // ==================== Financial Info ====================

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "shipping_fee", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal finalAmount;

    // ==================== Status & Payment ====================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    // ==================== Address & Notes ====================

    @Column(name = "shipping_address_json", columnDefinition = "JSON", nullable = false)
    private String shippingAddressJson;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    // ==================== Relations ====================

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<com.e_commerce.glasses_store.modules.review.entity.Review> reviews = new ArrayList<>();

    // ==================== Enums ====================

    public enum OrderStatus {
        PENDING, PAID, PACKING, SHIPPING, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        UNPAID, PAID, REFUNDED
    }

    public enum PaymentMethod {
        COD, BANK_TRANSFER, VNPAY
    }
}
