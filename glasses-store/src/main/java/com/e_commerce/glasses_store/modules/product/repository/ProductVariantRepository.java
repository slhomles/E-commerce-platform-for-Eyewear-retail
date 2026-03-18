package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {
    java.util.Optional<ProductVariant> findBySku(String sku);
}
