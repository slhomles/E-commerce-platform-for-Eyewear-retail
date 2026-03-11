package com.e_commerce.glasses_store.modules.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lightweight DTO cho danh sách đơn hàng — không kèm items chi tiết.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponse {

    private String id;
    private String code;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal finalAmount;
    private int totalItems;
    private LocalDateTime createdAt;
}
