package com.e_commerce.glasses_store.modules.product.exception;

/**
 * Thrown when a product is not found by slug or id.
 */
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String identifier) {
        super("Product not found: " + identifier);
    }
}
