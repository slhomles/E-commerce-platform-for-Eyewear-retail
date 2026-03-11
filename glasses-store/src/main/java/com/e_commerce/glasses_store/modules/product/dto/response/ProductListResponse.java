package com.e_commerce.glasses_store.modules.product.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho list view (card sản phẩm).
 * Chỉ trả fields cần thiết để render card, tối ưu bandwidth.
 */
public record ProductListResponse(
        String id,
        String name,
        String slug,
        String imageUrl,
        BigDecimal basePrice,
        BigDecimal salePrice,
        Integer discountPercent,
        String brandName,
        String categoryName,
        String gender,
        String frameShape,
        String type,
        String status,
        boolean inStock,
        LocalDateTime createdAt) {
}
