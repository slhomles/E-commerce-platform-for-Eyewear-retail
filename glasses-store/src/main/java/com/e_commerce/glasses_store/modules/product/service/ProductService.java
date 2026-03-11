package com.e_commerce.glasses_store.modules.product.service;

import com.e_commerce.glasses_store.modules.product.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product service interface — Public product browsing operations.
 */
public interface ProductService {

    /**
     * Lấy danh sách sản phẩm với multi-criteria filtering + pagination.
     */
    Page<ProductListResponse> getProducts(
            String brand, String category, String gender, String type,
            BigDecimal minPrice, BigDecimal maxPrice,
            String frameMaterial, String frameShape, String rimType,
            String frameSize, String style, Boolean onSale,
            Pageable pageable);

    /**
     * Lấy chi tiết sản phẩm theo slug (SEO-friendly).
     */
    ProductDetailResponse getProductBySlug(String slug);

    /**
     * Fulltext search sản phẩm.
     */
    Page<ProductListResponse> searchProducts(String keyword, Pageable pageable);

    /**
     * Sản phẩm nổi bật (đang giảm giá).
     */
    List<ProductListResponse> getFeaturedProducts(int limit);

    /**
     * Sản phẩm gợi ý (mới nhất).
     */
    List<ProductListResponse> getRecommendedProducts(int limit);

    /**
     * Sản phẩm liên quan (cùng category).
     */
    List<ProductListResponse> getRelatedProducts(String productId, int limit);

    /**
     * Danh sách categories.
     */
    List<CategoryResponse> getAllCategories();

    /**
     * Danh sách brands.
     */
    List<BrandResponse> getAllBrands();
}
