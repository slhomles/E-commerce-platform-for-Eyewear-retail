package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.dto.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminService;
import com.e_commerce.glasses_store.modules.product.dto.response.CategoryResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.ProductListResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin APIs — theo API Contract.
 * Yêu cầu role ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * POST /api/v1/admin/categories — Tạo danh mục mới.
     */
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse category = adminService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(category));
    }

    /**
     * POST /api/v1/admin/inventory/import — Nhập hàng tồn kho batch.
     */
    @PostMapping("/inventory/import")
    public ResponseEntity<ApiResponse<Void>> importInventory(
            @Valid @RequestBody InventoryImportRequest request) {
        adminService.importInventory(request);
        return ResponseEntity.ok(ApiResponse.success("Inventory imported successfully", null));
    }

    /**
     * GET /api/v1/admin/stats/revenue — Thống kê doanh thu.
     */
    @GetMapping("/stats/revenue")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getRevenueStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRevenueStats()));
    }

    // ==================== Product CRUD (Bổ sung) ====================

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductListResponse> result = adminService.getAllProducts(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductListResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductListResponse created = adminService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductListResponse>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateProduct(id, request)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
