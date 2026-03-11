package com.e_commerce.glasses_store.modules.product.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO chi tiết sản phẩm — trang product detail.
 * Bao gồm specs, variants, inventory.
 */
public record ProductDetailResponse(
        String id,
        String name,
        String slug,
        String description,
        BigDecimal basePrice,
        BigDecimal salePrice,
        Integer discountPercent,
        String type,
        String status,
        String gender,
        String frameMaterial,
        String frameShape,
        String rimType,
        String hingeType,
        String nosePadType,
        String frameSize,
        List<String> faceShapeFit,
        String style,
        boolean supportPrescription,
        boolean supportProgressive,
        BrandInfo brand,
        CategoryInfo category,
        SpecInfo specs,
        List<VariantInfo> variants,
        LocalDateTime createdAt) {
    public record BrandInfo(String id, String name, String slug, String logoUrl, String originCountry) {
    }

    public record CategoryInfo(String id, String name, String slug) {
    }

    public record SpecInfo(
            BigDecimal lensWidth, BigDecimal bridgeWidth, BigDecimal templeLength,
            BigDecimal lensHeight, BigDecimal frameWidth, BigDecimal weightGram) {
    }

    public record VariantInfo(
            String id, String sku, String colorName, String colorHex,
            String imageUrl, List<String> imageGallery,
            BigDecimal priceAdjustment, BigDecimal finalPrice,
            boolean isActive, int stockAvailable) {
    }
}
