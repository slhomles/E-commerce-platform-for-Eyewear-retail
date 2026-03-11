package com.e_commerce.glasses_store.modules.product.dto.response;

/**
 * DTO cho danh mục sản phẩm.
 */
public record CategoryResponse(
        String id,
        String name,
        String slug,
        String description,
        String parentId,
        String imageUrl,
        boolean isActive) {
}
