package com.e_commerce.glasses_store.modules.product.dto.response;

/**
 * DTO cho thương hiệu.
 */
public record BrandResponse(
        String id,
        String name,
        String slug,
        String description,
        String logoUrl,
        String originCountry) {
}
