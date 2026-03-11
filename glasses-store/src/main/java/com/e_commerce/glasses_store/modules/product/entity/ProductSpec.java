package com.e_commerce.glasses_store.modules.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Thông số kỹ thuật kính (1-1 với Product).
 * Maps to Flyway V3: product_specs table.
 */
@Entity
@Table(name = "product_specs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpec {

    @Id
    @Column(name = "product_id", length = 36)
    private String productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "lens_width", precision = 5, scale = 2)
    private BigDecimal lensWidth;

    @Column(name = "bridge_width", precision = 5, scale = 2)
    private BigDecimal bridgeWidth;

    @Column(name = "temple_length", precision = 5, scale = 2)
    private BigDecimal templeLength;

    @Column(name = "lens_height", precision = 5, scale = 2)
    private BigDecimal lensHeight;

    @Column(name = "frame_width", precision = 5, scale = 2)
    private BigDecimal frameWidth;

    @Column(name = "weight_gram", precision = 6, scale = 2)
    private BigDecimal weightGram;
}
