package com.e_commerce.glasses_store.modules.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tồn kho theo variant — dùng Optimistic Locking tránh overselling.
 * Maps to Flyway V4: inventory_stocks table.
 */
@Entity
@Table(name = "inventory_stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryStock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false, unique = true)
    private ProductVariant productVariant;

    @Column(name = "quantity_on_hand", nullable = false)
    @Builder.Default
    private Integer quantityOnHand = 0;

    @Column(name = "quantity_reserved", nullable = false)
    @Builder.Default
    private Integer quantityReserved = 0;

    @Column(name = "warehouse_location", length = 100)
    private String warehouseLocation;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==================== Business Methods ====================

    /**
     * Số lượng có thể bán = tồn kho - đang giữ.
     */
    public int getAvailableQuantity() {
        return quantityOnHand - quantityReserved;
    }

    /**
     * Kiểm tra có đủ hàng hay không.
     */
    public boolean hasStock(int requestedQty) {
        return getAvailableQuantity() >= requestedQty;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
