package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

        Optional<Product> findBySlugAndIsDeletedFalse(String slug);

        Optional<Product> findBySlug(String slug);

        Optional<Product> findByIdAndIsDeletedFalse(String id);

        /**
         * MySQL FULLTEXT search trên name + description + frame_shape.
         */
        @Query(value = "SELECT p.* FROM products p WHERE p.is_deleted = false AND p.is_active = true " +
                        "AND MATCH(p.name, p.description, p.frame_shape) AGAINST(:keyword IN BOOLEAN MODE)", countQuery = "SELECT COUNT(*) FROM products p WHERE p.is_deleted = false AND p.is_active = true "
                                        +
                                        "AND MATCH(p.name, p.description, p.frame_shape) AGAINST(:keyword IN BOOLEAN MODE)", nativeQuery = true)
        Page<Product> fulltextSearch(@Param("keyword") String keyword, Pageable pageable);

        /**
         * Sản phẩm nổi bật: đang giảm giá (salePrice != null).
         */
        @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.isActive = true " +
                        "AND p.salePrice IS NOT NULL ORDER BY p.createdAt DESC")
        List<Product> findFeatured(Pageable pageable);

        /**
         * Sản phẩm gợi ý: mới nhất.
         */
        @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.isActive = true " +
                        "ORDER BY p.createdAt DESC")
        List<Product> findRecommended(Pageable pageable);

        /**
         * Sản phẩm liên quan: cùng category, khác sản phẩm hiện tại.
         */
        @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.isActive = true " +
                        "AND p.category.id = :categoryId AND p.id <> :excludeId ORDER BY p.createdAt DESC")
        List<Product> findRelated(@Param("categoryId") String categoryId,
                        @Param("excludeId") String excludeId,
                        Pageable pageable);

        long countByIsDeletedFalse();
}
