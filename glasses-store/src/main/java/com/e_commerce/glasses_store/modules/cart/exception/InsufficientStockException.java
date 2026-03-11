package com.e_commerce.glasses_store.modules.cart.exception;

/**
 * Thrown when requested quantity exceeds available stock.
 */
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String sku, int requested, int available) {
        super(String.format("Insufficient stock for SKU '%s': requested %d, available %d",
                sku, requested, available));
    }
}
