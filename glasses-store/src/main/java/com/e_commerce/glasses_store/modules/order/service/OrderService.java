package com.e_commerce.glasses_store.modules.order.service;

import com.e_commerce.glasses_store.modules.order.dto.request.PlaceOrderRequest;
import com.e_commerce.glasses_store.modules.order.dto.request.UpdateOrderStatusRequest;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderListResponse;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order Service interface.
 */
public interface OrderService {

    /**
     * Đặt hàng từ giỏ hàng hiện tại của user.
     */
    OrderResponse placeOrder(String userId, PlaceOrderRequest request);

    /**
     * Danh sách đơn hàng của user — hỗ trợ filter + pagination.
     */
    Page<OrderListResponse> getMyOrders(String userId, String status, String paymentStatus,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            BigDecimal minAmount, BigDecimal maxAmount,
            Pageable pageable);

    /**
     * Chi tiết đơn hàng cho user (kiểm tra quyền sở hữu).
     */
    OrderResponse getOrderDetail(String userId, String orderId);

    /**
     * Hủy đơn hàng — chỉ cho phép từ trạng thái PENDING.
     */
    OrderResponse cancelOrder(String userId, String orderId);

    // ==================== Admin APIs ====================

    /**
     * Admin: Danh sách tất cả đơn hàng — filter đầy đủ.
     */
    Page<OrderListResponse> getAllOrders(String status, String paymentStatus, String paymentMethod,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            BigDecimal minAmount, BigDecimal maxAmount,
            Pageable pageable);

    /**
     * Admin: Chi tiết đơn hàng (không kiểm tra quyền sở hữu).
     */
    OrderResponse getOrderDetailAdmin(String orderId);

    /**
     * Admin: Cập nhật trạng thái đơn hàng.
     */
    OrderResponse updateOrderStatus(String orderId, UpdateOrderStatusRequest request);
}
