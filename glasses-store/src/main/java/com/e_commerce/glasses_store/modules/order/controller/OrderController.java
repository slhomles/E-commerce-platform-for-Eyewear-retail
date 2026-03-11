package com.e_commerce.glasses_store.modules.order.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.order.dto.request.PlaceOrderRequest;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderListResponse;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderResponse;
import com.e_commerce.glasses_store.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order APIs cho User — yêu cầu đăng nhập.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/v1/orders — Đặt hàng từ giỏ hàng hiện tại.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse order = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(order));
    }

    /**
     * GET /api/v1/orders — Danh sách đơn hàng của tôi (filter + pagination).
     *
     * Filters: status, paymentStatus, keyword (mã đơn), fromDate, toDate,
     * minAmount, maxAmount
     * Sort: newest (default), oldest, amount_asc, amount_desc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getMyOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<OrderListResponse> result = orderService.getMyOrders(
                user.getId(), status, paymentStatus, keyword, fromDate, toDate,
                minAmount, maxAmount,
                PageRequest.of(page, size, resolveSort(sortBy)));

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/orders/{id} — Chi tiết đơn hàng.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetail(user.getId(), id)));
    }

    /**
     * PUT /api/v1/orders/{id}/cancel — Hủy đơn hàng (chỉ PENDING).
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", orderService.cancelOrder(user.getId(), id)));
    }

    // ==================== Private Helpers ====================

    private Sort resolveSort(String sortBy) {
        return switch (sortBy) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "amount_asc" -> Sort.by("finalAmount").ascending();
            case "amount_desc" -> Sort.by("finalAmount").descending();
            default -> Sort.by("createdAt").descending(); // newest
        };
    }
}
