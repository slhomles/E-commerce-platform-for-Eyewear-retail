package com.e_commerce.glasses_store.modules.cart.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplyVoucherRequest(
        @NotBlank(message = "Voucher code is required") String code) {
}
