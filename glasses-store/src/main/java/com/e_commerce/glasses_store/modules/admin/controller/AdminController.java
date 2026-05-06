package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.dto.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminService;
import com.e_commerce.glasses_store.modules.admin.service.SiteSettingService;
import com.e_commerce.glasses_store.modules.admin.service.StatsService;
import com.e_commerce.glasses_store.modules.banner.dto.BannerResponse;
import com.e_commerce.glasses_store.modules.banner.dto.CreateBannerRequest;
import com.e_commerce.glasses_store.modules.banner.dto.UpdateBannerRequest;
import com.e_commerce.glasses_store.modules.banner.service.BannerService;
import com.e_commerce.glasses_store.modules.order.dto.request.UpdateOrderStatusRequest;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderListResponse;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderResponse;
import com.e_commerce.glasses_store.modules.order.service.OrderService;
import com.e_commerce.glasses_store.modules.product.dto.response.CategoryResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.ProductListResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private final OrderService orderService;
    private final BannerService bannerService;
    private final StatsService statsService;
    private final SiteSettingService siteSettingService;

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
     * GET /api/v1/admin/stats/revenue — Comprehensive revenue analytics.
     * Optional: ?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59
     */
    @GetMapping("/stats/revenue")
    public ResponseEntity<ApiResponse<RevenueStatsResponse>> getRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getRevenueStats(from, to)));
    }

    // ==================== Product CRUD (Bổ sung) ====================

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductListResponse> result = adminService.getAllProducts(
                keyword, PageRequest.of(page, size, Sort.by("createdAt").descending()));
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

    @PostMapping(value = "/products/import", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Void>> importProducts(
            @Valid @ModelAttribute ProductImportRequest request) {
        System.out.println(">>> RECEIVED IMPORT REQUEST: " + (request != null ? request.getFile().getOriginalFilename() : "NULL"));
        adminService.importProducts(request);
        return ResponseEntity.ok(ApiResponse.success("Products imported/updated successfully", null));
    }

    // ==================== Order Management ====================

    /**
     * GET /api/v1/admin/orders — Danh sách tất cả đơn hàng (filter + pagination).
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Sort sort = switch (sortBy) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "amount_asc" -> Sort.by("finalAmount").ascending();
            case "amount_desc" -> Sort.by("finalAmount").descending();
            default -> Sort.by("createdAt").descending();
        };

        Page<OrderListResponse> result = orderService.getAllOrders(
                status, paymentStatus, paymentMethod, keyword, fromDate, toDate,
                minAmount, maxAmount, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/admin/orders/{id} — Chi tiết đơn hàng.
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetailAdmin(id)));
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status — Cập nhật trạng thái đơn hàng.
     */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, request)));
    }

    /**
     * DELETE /api/v1/admin/orders/{id} — Xóa đơn hàng.
     */
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }

    // ==================== Banner Management ====================

    /**
     * GET /api/v1/admin/banners — Danh sách tất cả banner (admin).
     */
    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<Page<BannerResponse>>> getAllBanners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BannerResponse> result = bannerService.getAllBanners(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * POST /api/v1/admin/banners — Tạo banner mới.
     */
    @PostMapping("/banners")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @Valid @RequestBody CreateBannerRequest request) {
        BannerResponse banner = bannerService.createBanner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(banner));
    }

    /**
     * PUT /api/v1/admin/banners/{id} — Cập nhật banner.
     */
    @PutMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable String id,
            @Valid @RequestBody UpdateBannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bannerService.updateBanner(id, request)));
    }

    /**
     * DELETE /api/v1/admin/banners/{id} — Xóa banner.
     */
    @DeleteMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable String id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", null));
    }

    /**
     * PATCH /api/v1/admin/banners/{id}/toggle — Bật/tắt banner.
     */
    @PatchMapping("/banners/{id}/toggle")
    public ResponseEntity<ApiResponse<BannerResponse>> toggleBanner(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bannerService.toggleBannerStatus(id)));
    }

    // ==================== Site Settings ====================

    /**
     * GET /api/v1/admin/settings — Lấy tất cả cấu hình hiển thị sản phẩm (ADMIN).
     */
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<java.util.List<SiteSettingDto>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.getAllSettings()));
    }

    /**
     * PUT /api/v1/admin/settings/{key} — Cập nhật một cấu hình (ADMIN).
     */
    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<SiteSettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody UpdateSettingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.updateSetting(key, request.value())));
    }
}

