package com.e_commerce.glasses_store.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddToCartRequest(
        @NotBlank(message = "Variant ID is required") String variantId,

        @Min(value = 1, message = "Quantity must be at least 1") int quantity) {
}
