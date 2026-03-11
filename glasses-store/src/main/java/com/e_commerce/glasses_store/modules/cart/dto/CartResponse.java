package com.e_commerce.glasses_store.modules.cart.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cart response gồm items + tính toán tổng.
 */
public record CartResponse(
        String cartId,
        List<CartItemResponse> items,
        int totalItems,
        BigDecimal subtotal,
        String voucherCode,
        BigDecimal discountAmount,
        BigDecimal total) {
    public record CartItemResponse(
            String itemId,
            String variantId,
            String productId,
            String productName,
            String productSlug,
            String colorName,
            String colorHex,
            String imageUrl,
            String sku,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal,
            int stockAvailable) {
    }
}
