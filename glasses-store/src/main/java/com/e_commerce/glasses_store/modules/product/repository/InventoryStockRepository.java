package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
