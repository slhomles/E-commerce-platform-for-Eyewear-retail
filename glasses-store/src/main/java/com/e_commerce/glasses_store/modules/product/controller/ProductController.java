package com.e_commerce.glasses_store.modules.product.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.*;
import com.e_commerce.glasses_store.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public Product APIs — theo API Contract.
 * Không yêu cầu authentication.
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/v1/products
     * List + multi-criteria filter + paginate + sort.
     *
     * Sort options: price_asc, price_desc, newest, name_asc, name_desc
     */
    @GetMapping("/api/v1/products")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getProducts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String frameMaterial,
            @RequestParam(required = false) String frameShape,
            @RequestParam(required = false) String rimType,
            @RequestParam(required = false) String frameSize,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, resolveSort(sortBy));

        Page<ProductListResponse> result = productService.getProducts(
                brand, category, gender, type, minPrice, maxPrice,
                frameMaterial, frameShape, rimType, frameSize, style, onSale,
                pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/products/search?keyword=...
     */
    @GetMapping("/api/v1/products/search")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<ProductListResponse> result = productService.searchProducts(
                keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/products/featured
     */
    @GetMapping("/api/v1/products/featured")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts(limit)));
    }

    /**
     * GET /api/v1/products/recommended
     */
    @GetMapping("/api/v1/products/recommended")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getRecommendedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getRecommendedProducts(limit)));
    }

    /**
     * GET /api/v1/products/{slug}
     */
    @GetMapping("/api/v1/products/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductBySlug(
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }

    /**
     * GET /api/v1/products/{id}/related
     */
    @GetMapping("/api/v1/products/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getRelatedProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getRelatedProducts(id, limit)));
    }

    /**
     * GET /api/v1/categories
     */
    @GetMapping("/api/v1/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllCategories()));
    }

    /**
     * GET /api/v1/brands
     */
    @GetMapping("/api/v1/brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllBrands()));
    }

    // ==================== Private Helpers ====================

    private Sort resolveSort(String sortBy) {
        return switch (sortBy) {
            case "price_asc" -> Sort.by("basePrice").ascending();
            case "price_desc" -> Sort.by("basePrice").descending();
            case "name_asc" -> Sort.by("name").ascending();
            case "name_desc" -> Sort.by("name").descending();
            default -> Sort.by("createdAt").descending(); // newest
        };
    }
}
