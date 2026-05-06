package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.dto.request.CreateVoucherRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminVoucherService;
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
 * Admin Voucher Management APIs.
 * Yêu cầu role ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin/vouchers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminVoucherController {

    private final AdminVoucherService adminVoucherService;

    /**
     * GET /api/v1/admin/vouchers — Danh sách voucher (filter + pagination).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VoucherListResponse>>> getAllVouchers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String discountType,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Sort sort = switch (sortBy) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "code_asc" -> Sort.by("code").ascending();
            case "usage_desc" -> Sort.by("usedCount").descending();
            default -> Sort.by("createdAt").descending();
        };

        Page<VoucherListResponse> result = adminVoucherService.getAllVouchers(
                keyword, status, discountType, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/admin/vouchers/stats — Thống kê voucher.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<VoucherStatsResponse>> getVoucherStats() {
        return ResponseEntity.ok(ApiResponse.success(adminVoucherService.getVoucherStats()));
    }

    /**
     * GET /api/v1/admin/vouchers/{id} — Chi tiết voucher.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(adminVoucherService.getVoucherById(id)));
    }

    /**
     * POST /api/v1/admin/vouchers — Tạo voucher mới.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(
            @Valid @RequestBody CreateVoucherRequest request) {
        VoucherResponse voucher = adminVoucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(voucher));
    }

    /**
     * PUT /api/v1/admin/vouchers/{id} — Cập nhật voucher.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable String id,
            @Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminVoucherService.updateVoucher(id, request)));
    }

    /**
     * DELETE /api/v1/admin/vouchers/{id} — Xóa hoặc vô hiệu hóa voucher.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable String id) {
        adminVoucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success("Voucher deleted successfully", null));
    }

    /**
     * PATCH /api/v1/admin/vouchers/{id}/toggle — Bật/tắt voucher.
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleVoucherActive(
            @PathVariable String id,
            @RequestParam boolean active) {
        adminVoucherService.toggleVoucherActive(id, active);
        return ResponseEntity.ok(ApiResponse.success(
                active ? "Voucher activated" : "Voucher deactivated", null));
    }

    /**
     * GET /api/v1/admin/vouchers/{id}/usages — Lịch sử sử dụng voucher.
     */
    @GetMapping("/{id}/usages")
    public ResponseEntity<ApiResponse<Page<VoucherUsageResponse>>> getVoucherUsages(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<VoucherUsageResponse> result = adminVoucherService.getVoucherUsages(
                id, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
