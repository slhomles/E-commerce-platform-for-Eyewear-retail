package com.e_commerce.glasses_store.modules.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chi tiết đơn hàng — bao gồm items + status timeline.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String id;
    private String code;

    // Financial
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;

    // Status
    private String status;
    private String paymentStatus;
    private String paymentMethod;

    // Address & notes
    private ShippingAddressResponse shippingAddress;
    private String customerNote;
    private String trackingNumber;
    private String voucherCode;

    // Items
    private List<OrderItemResponse> items;

    // Timeline
    private List<StatusHistoryResponse> statusHistory;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ==================== Nested DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private String id;
        private String productVariantId;
        private String productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusHistoryResponse {
        private String id;
        private String status;
        private String note;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingAddressResponse {
        private String fullName;
        private String phone;
        private String address;
        private String ward;
        private String district;
        private String city;
    }
}
