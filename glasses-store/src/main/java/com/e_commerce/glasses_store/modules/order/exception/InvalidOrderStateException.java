package com.e_commerce.glasses_store.modules.order.exception;

/**
 * Exception khi trạng thái đơn hàng không hợp lệ để thực hiện thao tác.
 * VD: Huỷ đơn đã SHIPPED, cập nhật đơn đã CANCELLED.
 */
public class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
