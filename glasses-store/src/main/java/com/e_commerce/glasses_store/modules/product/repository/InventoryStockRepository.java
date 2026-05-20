package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, String> {

    Optional<InventoryStock> findByProductVariantId(String productVariantId);

    /**
     * Tìm sản phẩm sắp hết hàng (tồn kho <= threshold).
     */
    List<InventoryStock> findByQuantityOnHandLessThanEqual(int threshold);

    /**
     * Trừ thẳng quantity_on_hand bằng SQL UPDATE — tránh vấn đề JPA entity detach.
     * Trả về số rows bị ảnh hưởng (0 nếu không tìm thấy record).
     */
    @Modifying
    @Query("UPDATE InventoryStock s SET s.quantityOnHand = s.quantityOnHand - :qty WHERE s.productVariant.id = :variantId")
    int decrementStock(@Param("variantId") String variantId, @Param("qty") int qty);
}
