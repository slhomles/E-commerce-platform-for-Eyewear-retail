package com.e_commerce.glasses_store.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateCartItemRequest(
        @NotBlank(message = "Item ID is required") String itemId,

        @Min(value = 1, message = "Quantity must be at least 1") int quantity) {
}
