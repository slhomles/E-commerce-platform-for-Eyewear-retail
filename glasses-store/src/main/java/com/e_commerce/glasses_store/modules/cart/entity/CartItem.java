package com.e_commerce.glasses_store.modules.cart.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import com.e_commerce.glasses_store.modules.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.*;

/**
 * Item trong giỏ hàng.
 * Maps to Flyway V7: cart_items table.
 */
@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_cart_item_variant", columnNames = { "cart_id", "product_variant_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;
}
