package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminService;
import com.e_commerce.glasses_store.modules.product.dto.response.CategoryResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.ProductListResponse;
import com.e_commerce.glasses_store.modules.product.entity.*;
import com.e_commerce.glasses_store.modules.product.exception.CategoryNotFoundException;
import com.e_commerce.glasses_store.modules.product.exception.ProductNotFoundException;
import com.e_commerce.glasses_store.modules.product.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest req) {
        if (categoryRepository.existsBySlug(req.slug())) {
            throw new IllegalArgumentException("Category slug already exists: " + req.slug());
        }
        Category category = Category.builder()
                .name(req.name())
                .slug(req.slug())
                .description(req.description())
                .parentId(req.parentId())
                .imageUrl(req.imageUrl())
                .build();
        category = categoryRepository.save(category);
        return new CategoryResponse(
                category.getId(), category.getName(), category.getSlug(),
                category.getDescription(), category.getParentId(),
                category.getImageUrl(), category.getIsActive());
    }

    @Override
    public void importInventory(InventoryImportRequest request) {
        for (InventoryImportRequest.ImportItem item : request.items()) {
            ProductVariant variant = variantRepository.findById(item.variantId())
                    .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + item.variantId()));

            InventoryStock stock = inventoryStockRepository.findByProductVariantId(item.variantId())
                    .orElseGet(() -> InventoryStock.builder()
                            .productVariant(variant)
                            .quantityOnHand(0)
                            .build());

            stock.setQuantityOnHand(stock.getQuantityOnHand() + item.quantity());
            if (item.warehouseLocation() != null) {
                stock.setWarehouseLocation(item.warehouseLocation());
            }
            inventoryStockRepository.save(stock);
        }
        log.info("Imported inventory for {} items", request.items().size());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getRevenueStats() {
        long totalProducts = productRepository.countByIsDeletedFalse();
        long totalCategories = categoryRepository.count();
        long totalBrands = brandRepository.count();
        long lowStockCount = inventoryStockRepository.findByQuantityOnHandLessThanEqual(5).size();

        return new DashboardStatsResponse(
                totalProducts, totalCategories, totalBrands, lowStockCount,
                BigDecimal.ZERO // TODO: Tính revenue từ order module khi sẵn sàng
        );
    }

    @Override
    public ProductListResponse createProduct(CreateProductRequest req) {
        Brand brand = brandRepository.findById(req.brandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found: " + req.brandId()));
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(req.categoryId()));

        Product product = Product.builder()
                .name(req.name())
                .slug(req.slug())
                .description(req.description())
                .brand(brand)
                .category(category)
                .basePrice(req.basePrice())
                .salePrice(req.salePrice())
                .frameMaterial(req.frameMaterial())
                .frameShape(req.frameShape())
                .rimType(req.rimType())
                .hingeType(req.hingeType())
                .nosePadType(req.nosePadType())
                .frameSize(req.frameSize())
                .style(req.style())
                .supportPrescription(req.supportPrescription())
                .supportProgressive(req.supportProgressive())
                .build();

        if (req.type() != null)
            product.setType(Product.ProductType.valueOf(req.type().toUpperCase()));
        if (req.gender() != null)
            product.setGender(Product.Gender.valueOf(req.gender().toUpperCase()));
        if (req.faceShapeFit() != null) {
            try {
                product.setFaceShapeFit(objectMapper.writeValueAsString(req.faceShapeFit()));
            } catch (Exception e) {
                log.warn("Failed to serialize faceShapeFit", e);
            }
        }

        product = productRepository.save(product);

        // Specs
        if (hasSpecs(req)) {
            ProductSpec spec = ProductSpec.builder()
                    .product(product)
                    .lensWidth(req.lensWidth())
                    .bridgeWidth(req.bridgeWidth())
                    .templeLength(req.templeLength())
                    .lensHeight(req.lensHeight())
                    .frameWidth(req.frameWidth())
                    .weightGram(req.weightGram())
                    .build();
            product.setProductSpec(spec);
        }

        // Variants + Inventory
        if (req.variants() != null) {
            for (CreateProductRequest.VariantRequest vr : req.variants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vr.sku())
                        .colorName(vr.colorName())
                        .colorHex(vr.colorHex())
                        .imageUrl(vr.imageUrl())
                        .priceAdjustment(vr.priceAdjustment() != null ? vr.priceAdjustment() : BigDecimal.ZERO)
                        .build();
                if (vr.imageGallery() != null) {
                    try {
                        variant.setImageGallery(objectMapper.writeValueAsString(vr.imageGallery()));
                    } catch (Exception e) {
                        log.warn("Failed to serialize imageGallery", e);
                    }
                }
                variant = variantRepository.save(variant);

                if (vr.initialStock() > 0) {
                    InventoryStock stock = InventoryStock.builder()
                            .productVariant(variant)
                            .quantityOnHand(vr.initialStock())
                            .build();
                    inventoryStockRepository.save(stock);
                }
            }
        }

        product = productRepository.save(product);
        return toListResponse(product);
    }

    @Override
    public ProductListResponse updateProduct(String id, CreateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setName(req.name());
        product.setSlug(req.slug());
        product.setDescription(req.description());
        product.setBasePrice(req.basePrice());
        product.setSalePrice(req.salePrice());
        product.setFrameMaterial(req.frameMaterial());
        product.setFrameShape(req.frameShape());
        product.setRimType(req.rimType());
        product.setStyle(req.style());
        product.setFrameSize(req.frameSize());

        if (req.brandId() != null) {
            Brand brand = brandRepository.findById(req.brandId())
                    .orElseThrow(() -> new IllegalArgumentException("Brand not found: " + req.brandId()));
            product.setBrand(brand);
        }
        if (req.categoryId() != null) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new CategoryNotFoundException(req.categoryId()));
            product.setCategory(category);
        }
        if (req.type() != null)
            product.setType(Product.ProductType.valueOf(req.type().toUpperCase()));
        if (req.gender() != null)
            product.setGender(Product.Gender.valueOf(req.gender().toUpperCase()));

        // Update Specs
        if (hasSpecs(req)) {
            ProductSpec spec = product.getProductSpec();
            if (spec == null) {
                spec = ProductSpec.builder().product(product).build();
                product.setProductSpec(spec);
            }
            spec.setLensWidth(req.lensWidth());
            spec.setBridgeWidth(req.bridgeWidth());
            spec.setTempleLength(req.templeLength());
            spec.setLensHeight(req.lensHeight());
            spec.setFrameWidth(req.frameWidth());
            spec.setWeightGram(req.weightGram());
        }

        product = productRepository.save(product);

        // Update Variants and Inventory (only handling the first variant for Admin CRUD
        // simplicity)
        if (req.variants() != null && !req.variants().isEmpty()) {
            CreateProductRequest.VariantRequest vr = req.variants().get(0);
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                ProductVariant variant = product.getVariants().get(0);
                variant.setColorName(vr.colorName());
                if (vr.colorHex() != null)
                    variant.setColorHex(vr.colorHex());
                if (vr.imageUrl() != null && !vr.imageUrl().isEmpty()) {
                    variant.setImageUrl(vr.imageUrl());
                }

                if (vr.imageGallery() != null) {
                    try {
                        variant.setImageGallery(objectMapper.writeValueAsString(vr.imageGallery()));
                    } catch (Exception e) {
                    }
                }
                variantRepository.save(variant);

                // Update stock
                InventoryStock stock = inventoryStockRepository.findByProductVariantId(variant.getId())
                        .orElseGet(() -> InventoryStock.builder().productVariant(variant).quantityOnHand(0).build());
                stock.setQuantityOnHand(vr.initialStock());
                inventoryStockRepository.save(stock);
            } else {
                // If there were no variants before, create one
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vr.sku())
                        .colorName(vr.colorName())
                        .colorHex(vr.colorHex())
                        .imageUrl(vr.imageUrl())
                        .priceAdjustment(vr.priceAdjustment() != null ? vr.priceAdjustment() : BigDecimal.ZERO)
                        .build();
                if (vr.imageGallery() != null) {
                    try {
                        variant.setImageGallery(objectMapper.writeValueAsString(vr.imageGallery()));
                    } catch (Exception e) {
                    }
                }
                variant = variantRepository.save(variant);

                if (vr.initialStock() > 0) {
                    InventoryStock stock = InventoryStock.builder()
                            .productVariant(variant)
                            .quantityOnHand(vr.initialStock())
                            .build();
                    inventoryStockRepository.save(stock);
                }
            }
        }

        return toListResponse(product);
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setIsDeleted(true);
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product: {} ({})", product.getName(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> getAllProducts(Pageable pageable) {
        // Admin sees all products including inactive, but not deleted
        return productRepository.findAll(
                (root, query, cb) -> cb.isFalse(root.get("isDeleted")),
                pageable).map(this::toListResponse);
    }

    // ==================== Private ====================

    private boolean hasSpecs(CreateProductRequest req) {
        return req.lensWidth() != null || req.bridgeWidth() != null || req.templeLength() != null
                || req.lensHeight() != null || req.frameWidth() != null || req.weightGram() != null;
    }

    private ProductListResponse toListResponse(Product p) {
        String imageUrl = null;
        boolean inStock = false;
        Integer stockQuantity = 0;
        if (p.getVariants() != null && !p.getVariants().isEmpty()) {
            ProductVariant firstVariant = p.getVariants().get(0);
            imageUrl = firstVariant.getImageUrl();
            if (firstVariant.getInventoryStock() != null) {
                stockQuantity = firstVariant.getInventoryStock().getQuantityOnHand();
            }
            inStock = stockQuantity > 0;
        }
        return new ProductListResponse(
                p.getId(), p.getName(), p.getSlug(), imageUrl,
                p.getBasePrice(), p.getSalePrice(), null,
                p.getBrand() != null ? p.getBrand().getName() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getGender() != null ? p.getGender().name() : null,
                p.getFrameShape(),
                p.getType() != null ? p.getType().name() : null,
                p.getStatus() != null ? p.getStatus().name() : null,
                inStock, stockQuantity, null, 0, p.getCreatedAt());
    }
}
