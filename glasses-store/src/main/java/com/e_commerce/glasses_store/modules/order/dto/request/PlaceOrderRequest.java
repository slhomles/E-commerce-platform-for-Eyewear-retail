package com.e_commerce.glasses_store.modules.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body cho API đặt hàng.
 * Dữ liệu items sẽ được lấy từ Cart hiện tại của user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceOrderRequest {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, BANK_TRANSFER, VNPAY

    @NotNull(message = "Shipping address is required")
    @Valid
    private ShippingAddress shippingAddress;

    private String customerNote;

    private String voucherCode;

    private String vnpaySubMethod;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingAddress {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Phone is required")
        private String phone;

        @NotBlank(message = "Address is required")
        private String address;

        private String ward;
        private String district;

        @NotBlank(message = "City is required")
        private String city;
    }
}
