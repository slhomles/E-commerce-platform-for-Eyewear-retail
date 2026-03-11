package com.e_commerce.glasses_store.modules.product.service.impl;

import com.e_commerce.glasses_store.modules.product.dto.response.*;
import com.e_commerce.glasses_store.modules.product.entity.*;
import com.e_commerce.glasses_store.modules.product.exception.ProductNotFoundException;
import com.e_commerce.glasses_store.modules.product.repository.*;
import com.e_commerce.glasses_store.modules.product.service.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

/**
 * Implementation of ProductService.
 * Tối ưu:
 * - JPA Specification chain thay vì N+1 if/else
 * - Projection (chỉ map fields cần thiết cho list view)
 * - Eager fetch cho detail view (1 query thay vì N+1)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Page<ProductListResponse> getProducts(
            String brand, String category, String gender, String type,
            BigDecimal minPrice, BigDecimal maxPrice,
            String frameMaterial, String frameShape, String rimType,
            String frameSize, String style, Boolean onSale,
            Pageable pageable) {

        Specification<Product> spec = Specification.where(ProductSpecification.isActive());

        if (StringUtils.hasText(brand))
            spec = spec.and(ProductSpecification.hasBrand(brand));
        if (StringUtils.hasText(category))
            spec = spec.and(ProductSpecification.hasCategory(category));
        if (StringUtils.hasText(gender))
            spec = spec.and(ProductSpecification.hasGender(gender));
        if (StringUtils.hasText(type))
            spec = spec.and(ProductSpecification.hasType(type));
        if (minPrice != null || maxPrice != null)
            spec = spec.and(ProductSpecification.priceBetween(minPrice, maxPrice));
        if (StringUtils.hasText(frameMaterial))
            spec = spec.and(ProductSpecification.hasFrameMaterial(frameMaterial));
        if (StringUtils.hasText(frameShape))
            spec = spec.and(ProductSpecification.hasFrameShape(frameShape));
        if (StringUtils.hasText(rimType))
            spec = spec.and(ProductSpecification.hasRimType(rimType));
        if (StringUtils.hasText(frameSize))
            spec = spec.and(ProductSpecification.hasFrameSize(frameSize));
        if (StringUtils.hasText(style))
            spec = spec.and(ProductSpecification.hasStyle(style));

        if (Boolean.TRUE.equals(onSale)) {
            spec = spec.and(ProductSpecification.onSale());
        }

        return productRepository.findAll(spec, pageable).map(this::toListResponse);
    }

    @Override
    public ProductDetailResponse getProductByIdOrSlug(String idOrSlug) {
        Product product = productRepository.findByIdAndIsDeletedFalse(idOrSlug)
                .orElseGet(() -> productRepository.findBySlugAndIsDeletedFalse(idOrSlug)
                        .orElseThrow(() -> new ProductNotFoundException(idOrSlug)));
        return toDetailResponse(product);
    }

    @Override
    public Page<ProductListResponse> searchProducts(String keyword, Pageable pageable) {
        // Append wildcard cho boolean mode search
        String searchTerm = keyword.trim() + "*";
        return productRepository.fulltextSearch(searchTerm, pageable).map(this::toListResponse);
    }

    @Override
    public List<ProductListResponse> getFeaturedProducts(int limit) {
        return productRepository.findFeatured(PageRequest.of(0, limit))
                .stream().map(this::toListResponse).toList();
    }

    @Override
    public List<ProductListResponse> getRecommendedProducts(int limit) {
        return productRepository.findRecommended(PageRequest.of(0, limit))
                .stream().map(this::toListResponse).toList();
    }

    @Override
    public List<ProductListResponse> getRelatedProducts(String productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return productRepository.findRelated(product.getCategory().getId(), productId, PageRequest.of(0, limit))
                .stream().map(this::toListResponse).toList();
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc()
                .stream()
                .map(c -> new CategoryResponse(
                        c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                        c.getParentId(), c.getImageUrl(), c.getIsActive()))
                .toList();
    }

    @Override
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findByIsDeletedFalseOrderByNameAsc()
                .stream()
                .map(b -> new BrandResponse(
                        b.getId(), b.getName(), b.getSlug(), b.getDescription(),
                        b.getLogoUrl(), b.getOriginCountry()))
                .toList();
    }

    // ==================== Private Mapping Methods ====================

    private ProductListResponse toListResponse(Product p) {
        // Lấy image từ variant đầu tiên (nếu có)
        String imageUrl = null;
        boolean inStock = false;
        if (p.getVariants() != null && !p.getVariants().isEmpty()) {
            ProductVariant firstVariant = p.getVariants().stream()
                    .filter(ProductVariant::getIsActive)
                    .findFirst().orElse(p.getVariants().get(0));
            imageUrl = firstVariant.getImageUrl();

            // Check tồn kho
            inStock = p.getVariants().stream()
                    .filter(v -> v.getIsActive() && v.getInventoryStock() != null)
                    .anyMatch(v -> v.getInventoryStock().getAvailableQuantity() > 0);
        }

        return new ProductListResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                imageUrl,
                p.getBasePrice(),
                p.getSalePrice(),
                calculateDiscountPercent(p.getBasePrice(), p.getSalePrice()),
                p.getBrand() != null ? p.getBrand().getName() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getGender() != null ? p.getGender().name() : null,
                p.getFrameShape(),
                p.getType() != null ? p.getType().name() : null,
                p.getStatus() != null ? p.getStatus().name() : null,
                inStock,
                p.getCreatedAt());
    }

    private ProductDetailResponse toDetailResponse(Product p) {
        // Brand
        ProductDetailResponse.BrandInfo brandInfo = null;
        if (p.getBrand() != null) {
            Brand b = p.getBrand();
            brandInfo = new ProductDetailResponse.BrandInfo(
                    b.getId(), b.getName(), b.getSlug(), b.getLogoUrl(), b.getOriginCountry());
        }

        // Category
        ProductDetailResponse.CategoryInfo categoryInfo = null;
        if (p.getCategory() != null) {
            Category c = p.getCategory();
            categoryInfo = new ProductDetailResponse.CategoryInfo(c.getId(), c.getName(), c.getSlug());
        }

        // Specs
        ProductDetailResponse.SpecInfo specInfo = null;
        if (p.getProductSpec() != null) {
            ProductSpec s = p.getProductSpec();
            specInfo = new ProductDetailResponse.SpecInfo(
                    s.getLensWidth(), s.getBridgeWidth(), s.getTempleLength(),
                    s.getLensHeight(), s.getFrameWidth(), s.getWeightGram());
        }

        // Variants
        List<ProductDetailResponse.VariantInfo> variantInfos = Collections.emptyList();
        if (p.getVariants() != null) {
            variantInfos = p.getVariants().stream()
                    .filter(ProductVariant::getIsActive)
                    .map(v -> {
                        BigDecimal finalPrice = p.getSalePrice() != null
                                ? p.getSalePrice().add(v.getPriceAdjustment())
                                : p.getBasePrice().add(v.getPriceAdjustment());
                        int stockAvailable = v.getInventoryStock() != null
                                ? v.getInventoryStock().getAvailableQuantity()
                                : 0;

                        return new ProductDetailResponse.VariantInfo(
                                v.getId(), v.getSku(), v.getColorName(), v.getColorHex(),
                                v.getImageUrl(), parseJsonList(v.getImageGallery()),
                                v.getPriceAdjustment(), finalPrice,
                                v.getIsActive(), stockAvailable);
                    })
                    .toList();
        }

        // Parse face shape fit JSON
        List<String> faceShapes = parseJsonList(p.getFaceShapeFit());

        return new ProductDetailResponse(
                p.getId(), p.getName(), p.getSlug(), p.getDescription(),
                p.getBasePrice(), p.getSalePrice(),
                calculateDiscountPercent(p.getBasePrice(), p.getSalePrice()),
                p.getType() != null ? p.getType().name() : null,
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getGender() != null ? p.getGender().name() : null,
                p.getFrameMaterial(), p.getFrameShape(),
                p.getRimType(), p.getHingeType(), p.getNosePadType(),
                p.getFrameSize(), faceShapes, p.getStyle(),
                Boolean.TRUE.equals(p.getSupportPrescription()),
                Boolean.TRUE.equals(p.getSupportProgressive()),
                brandInfo, categoryInfo, specInfo, variantInfos,
                p.getCreatedAt());
    }

    /**
     * Tính % giảm giá: round((base - sale) / base * 100)
     */
    private Integer calculateDiscountPercent(BigDecimal basePrice, BigDecimal salePrice) {
        if (salePrice == null || basePrice == null || basePrice.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return basePrice.subtract(salePrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(basePrice, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    /**
     * Parse JSON string array, e.g. '["url1","url2"]'
     */
    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank())
            return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse JSON list: {}", json, e);
            return Collections.emptyList();
        }
    }
}
