package com.e_commerce.glasses_store.modules.product.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Sản phẩm kính — entity chính.
 * Maps to Flyway V3: products table (20+ attributes for filter & AI
 * recommendation).
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_brand", columnList = "brand_id"),
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_gender", columnList = "gender"),
        @Index(name = "idx_products_type", columnList = "type"),
        @Index(name = "idx_products_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 300, unique = true)
    private String slug;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductType type = ProductType.FRAME;

    @Column(name = "base_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal basePrice;

    @Column(name = "sale_price", precision = 19, scale = 4)
    private BigDecimal salePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    // ==================== Filter & AI Attributes ====================

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Gender gender = Gender.UNISEX;

    @Column(name = "frame_material", length = 100)
    private String frameMaterial;

    @Column(name = "frame_shape", length = 50)
    private String frameShape;

    @Column(name = "rim_type", length = 20)
    private String rimType;

    @Column(name = "hinge_type", length = 50)
    private String hingeType;

    @Column(name = "nose_pad_type", length = 50)
    private String nosePadType;

    @Column(name = "frame_size", length = 5)
    private String frameSize;

    @Column(name = "face_shape_fit", columnDefinition = "JSON")
    private String faceShapeFit;

    @Column(length = 100)
    private String style;

    @Column(name = "support_prescription")
    @Builder.Default
    private Boolean supportPrescription = false;

    @Column(name = "support_progressive")
    @Builder.Default
    private Boolean supportProgressive = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // ==================== Relations ====================

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ProductSpec productSpec;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductVariant> variants;

    // ==================== Enums ====================

    public enum ProductType {
        FRAME, LENS, SERVICE
    }

    public enum ProductStatus {
        ACTIVE, INACTIVE, OUT_OF_STOCK
    }

    public enum Gender {
        MEN, WOMEN, UNISEX, KIDS
    }
}
