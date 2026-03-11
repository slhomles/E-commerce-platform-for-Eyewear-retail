package com.e_commerce.glasses_store.modules.order.exception;

/**
 * Exception khi không tìm thấy đơn hàng.
 */
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId);
    }
}
