package com.e_commerce.glasses_store.modules.cart.service;

import com.e_commerce.glasses_store.modules.cart.dto.CartResponse;

public interface CartService {

    CartResponse getCart(String userId);

    CartResponse addItem(String userId, String variantId, int quantity);

    CartResponse updateItem(String userId, String itemId, int quantity);

    CartResponse removeItem(String userId, String itemId);

    CartResponse applyVoucher(String userId, String voucherCode);
}
