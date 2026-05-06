package com.e_commerce.glasses_store.modules.cart.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Links a voucher to specific categories or products for targeting.
 */
@Entity
@Table(name = "voucher_applicable_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"voucher_id", "item_type", "item_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplicableItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ItemType itemType;

    @Column(name = "item_id", nullable = false, length = 36)
    private String itemId;

    public enum ItemType {
        CATEGORY, PRODUCT
    }
}
