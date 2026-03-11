package com.e_commerce.glasses_store.modules.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Chi tiết đơn hàng — snapshot dữ liệu sản phẩm tại thời điểm mua.
 * Maps to Flyway V5: order_items table.
 */
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_oi_order", columnList = "order_id"),
        @Index(name = "idx_oi_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_variant_id", nullable = false, length = 36)
    private String productVariantId;

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    // ==================== Data Snapshot ====================

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "sku", nullable = false, length = 50)
    private String sku;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal;

    @Column(name = "optical_data_json", columnDefinition = "JSON")
    private String opticalDataJson;
}
