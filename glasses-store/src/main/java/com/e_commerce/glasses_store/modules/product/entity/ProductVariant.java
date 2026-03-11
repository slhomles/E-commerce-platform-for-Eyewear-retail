package com.e_commerce.glasses_store.modules.product.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Biến thể sản phẩm (theo màu sắc).
 * Maps to Flyway V3: product_variants table.
 */
@Entity
@Table(name = "product_variants", indexes = {
        @Index(name = "idx_variants_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 50, unique = true)
    private String sku;

    @Column(name = "color_name", nullable = false, length = 50)
    private String colorName;

    @Column(name = "color_hex", length = 20)
    private String colorHex;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_gallery", columnDefinition = "JSON")
    private String imageGallery;

    @Column(name = "price_adjustment", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal priceAdjustment = BigDecimal.ZERO;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // ==================== Relation ====================

    @OneToOne(mappedBy = "productVariant", fetch = FetchType.LAZY)
    private InventoryStock inventoryStock;
}
