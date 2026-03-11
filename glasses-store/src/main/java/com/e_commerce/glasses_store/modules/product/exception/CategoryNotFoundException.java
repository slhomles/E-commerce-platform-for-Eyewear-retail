package com.e_commerce.glasses_store.modules.product.exception;

/**
 * Thrown when a category is not found.
 */
public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String identifier) {
        super("Category not found: " + identifier);
    }
}
