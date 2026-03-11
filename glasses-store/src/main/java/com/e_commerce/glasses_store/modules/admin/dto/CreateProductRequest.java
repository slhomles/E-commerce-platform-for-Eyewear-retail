package com.e_commerce.glasses_store.modules.admin.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request tạo/cập nhật sản phẩm.
 */
public record CreateProductRequest(
        @NotBlank(message = "Product name is required") String name,

        @NotBlank(message = "Product slug is required") String slug,

        String description,

        @NotBlank(message = "Brand ID is required") String brandId,

        @NotBlank(message = "Category ID is required") String categoryId,

        String type,

        @NotNull(message = "Base price is required") @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be positive") BigDecimal basePrice,

        BigDecimal salePrice,
        String gender,
        String frameMaterial,
        String frameShape,
        String rimType,
        String hingeType,
        String nosePadType,
        String frameSize,
        List<String> faceShapeFit,
        String style,
        Boolean supportPrescription,
        Boolean supportProgressive,

        // Specs
        BigDecimal lensWidth,
        BigDecimal bridgeWidth,
        BigDecimal templeLength,
        BigDecimal lensHeight,
        BigDecimal frameWidth,
        BigDecimal weightGram,

        // Variants
        List<VariantRequest> variants) {
    public record VariantRequest(
            @NotBlank String sku,
            @NotBlank String colorName,
            String colorHex,
            String imageUrl,
            List<String> imageGallery,
            BigDecimal priceAdjustment,
            int initialStock) {
    }
}
