package com.e_commerce.glasses_store.modules.order.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body cho Admin cập nhật trạng thái đơn hàng.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    private String status; // PENDING, PAID, PACKING, SHIPPING, DELIVERED, CANCELLED

    private String paymentStatus; // UNPAID, PAID, REFUNDED

    private String note; // Ghi chú (VD: Lý do huỷ)
}
