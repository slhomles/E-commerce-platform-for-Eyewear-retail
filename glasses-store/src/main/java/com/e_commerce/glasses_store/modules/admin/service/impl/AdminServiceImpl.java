package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminService;
import com.e_commerce.glasses_store.modules.admin.service.CloudinaryService;
import com.e_commerce.glasses_store.modules.product.dto.response.CategoryResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.ProductListResponse;
import com.e_commerce.glasses_store.modules.product.entity.*;
import com.e_commerce.glasses_store.modules.product.exception.CategoryNotFoundException;
import com.e_commerce.glasses_store.modules.product.exception.ProductNotFoundException;
import com.e_commerce.glasses_store.modules.product.repository.*;
import com.e_commerce.glasses_store.modules.product.entity.ProductSpec;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Element;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackageRelationship;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;

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
    private final ProductSpecRepository productSpecRepository;
    private final CloudinaryService cloudinaryService;
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
                .showOriginalPrice(req.showOriginalPrice() != null ? req.showOriginalPrice() : false)
                .showSalePrice(req.showSalePrice() != null ? req.showSalePrice() : true)
                .showDiscountBadge(req.showDiscountBadge() != null ? req.showDiscountBadge() : true)
                .priceDisplayOverridden(req.priceDisplayOverridden() != null ? req.priceDisplayOverridden() : false)
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
        if (req.showOriginalPrice() != null) product.setShowOriginalPrice(req.showOriginalPrice());
        if (req.showSalePrice() != null) product.setShowSalePrice(req.showSalePrice());
        if (req.showDiscountBadge() != null) product.setShowDiscountBadge(req.showDiscountBadge());
        if (req.priceDisplayOverridden() != null) product.setPriceDisplayOverridden(req.priceDisplayOverridden());

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

        // Update Variants and Inventory (Full support for multiple variants)
        if (req.variants() != null) {
            List<String> incomingSkus = req.variants().stream()
                    .map(CreateProductRequest.VariantRequest::sku)
                    .toList();

            // 1. Deactivate variants not in the update request
            if (product.getVariants() != null) {
                for (ProductVariant existingVariant : product.getVariants()) {
                    if (!incomingSkus.contains(existingVariant.getSku())) {
                        existingVariant.setIsActive(false);
                        variantRepository.save(existingVariant);
                    }
                }
            }

            // 2. Add or update variants from the request
            for (CreateProductRequest.VariantRequest vr : req.variants()) {
                ProductVariant variant = variantRepository.findBySku(vr.sku()).orElse(null);

                if (variant != null && variant.getProduct().getId().equals(product.getId())) {
                    // Update existing
                    variant.setColorName(vr.colorName());
                    if (vr.colorHex() != null) variant.setColorHex(vr.colorHex());
                    if (vr.imageUrl() != null && !vr.imageUrl().isEmpty()) variant.setImageUrl(vr.imageUrl());
                    if (vr.priceAdjustment() != null) variant.setPriceAdjustment(vr.priceAdjustment());
                    variant.setIsActive(true);

                    if (vr.imageGallery() != null) {
                        try {
                            variant.setImageGallery(objectMapper.writeValueAsString(vr.imageGallery()));
                        } catch (Exception e) {
                        }
                    }
                    variant = variantRepository.save(variant);

                    // Update stock
                    final ProductVariant finalVariant = variant;
                    InventoryStock stock = inventoryStockRepository.findByProductVariantId(variant.getId())
                            .orElseGet(() -> InventoryStock.builder().productVariant(finalVariant).quantityOnHand(0).build());
                    stock.setQuantityOnHand(vr.initialStock());
                    inventoryStockRepository.save(stock);
                } else if (variant == null) {
                    // Create new
                    ProductVariant newVariant = ProductVariant.builder()
                            .product(product)
                            .sku(vr.sku())
                            .colorName(vr.colorName())
                            .colorHex(vr.colorHex())
                            .imageUrl(vr.imageUrl())
                            .priceAdjustment(vr.priceAdjustment() != null ? vr.priceAdjustment() : BigDecimal.ZERO)
                            .isActive(true)
                            .build();

                    if (vr.imageGallery() != null) {
                        try {
                            newVariant.setImageGallery(objectMapper.writeValueAsString(vr.imageGallery()));
                        } catch (Exception e) {
                        }
                    }
                    newVariant = variantRepository.save(newVariant);

                    if (vr.initialStock() > 0) {
                        InventoryStock stock = InventoryStock.builder()
                                .productVariant(newVariant)
                                .quantityOnHand(vr.initialStock())
                                .build();
                        inventoryStockRepository.save(stock);
                    }
                } else {
                    // SKU already exists but belongs to a different product
                    log.warn("SKU {} already exists for another product. Skipping variant update.", vr.sku());
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
    public Page<ProductListResponse> getAllProducts(String keyword, Pageable pageable) {
        return productRepository.findAll((root, query, cb) -> {
            var predicate = cb.isFalse(root.get("isDeleted"));
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                // LEFT JOIN để không mất sản phẩm chưa gán brand/category
                var catJoin = root.join("category", jakarta.persistence.criteria.JoinType.LEFT);
                var brandJoin = root.join("brand", jakarta.persistence.criteria.JoinType.LEFT);
                var searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(cb.coalesce(catJoin.get("name"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(brandJoin.get("name"), "")), pattern)
                );
                predicate = cb.and(predicate, searchPredicate);
            }
            return predicate;
        }, pageable).map(this::toListResponse);
    }

    // ==================== Private ====================

    @Override
    @Transactional
    public void importProducts(ProductImportRequest request) {
        System.out.println(">>> SERVICE START: importProducts");
        log.info("Starting batch product import from Excel with embedded images");

        try {
            XSSFWorkbook workbook = (XSSFWorkbook) org.apache.poi.ss.usermodel.WorkbookFactory.create(request.getFile().getInputStream());
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);

            // Extract Place in Cell images
            Map<String, byte[]> cellImageMap = extractPlaceInCellImages(workbook);
            log.info("Extracted {} Place in Cell images from Excel", cellImageMap.size());

            // Extract Fallback images (from OPCPackage directly)
            List<byte[]> fallbackImages = new java.util.ArrayList<>();
            try {
                OPCPackage pkg = workbook.getPackage();
                java.util.List<PackagePart> parts = pkg.getParts();
                java.util.List<PackagePart> mediaParts = new java.util.ArrayList<>();
                for (PackagePart part : parts) {
                    if (part.getPartName().getName().startsWith("/xl/media/")) {
                        mediaParts.add(part);
                    }
                }
                mediaParts.sort((p1, p2) -> p1.getPartName().getName().compareTo(p2.getPartName().getName()));
                for (PackagePart part : mediaParts) {
                    try (java.io.InputStream is = part.getInputStream()) {
                        byte[] data = is.readAllBytes();
                        if (data.length > 100) {
                            fallbackImages.add(data);
                        }
                    }
                }
                log.info("Found {} fallback images in workbook via OPCPackage", fallbackImages.size());
            } catch (Exception e) {
                log.error("Error extracting fallback images via OPCPackage", e);
            }

            java.util.Iterator<org.apache.poi.ss.usermodel.Row> rows = sheet.iterator();
            if (!rows.hasNext()) return;

            // Parse header row to build column-name → index map (case-insensitive, strip units like "(mm)")
            org.apache.poi.ss.usermodel.Row headerRow = rows.next();
            Map<String, Integer> colIndex = new HashMap<>();
            for (int i = 0; i <= headerRow.getLastCellNum(); i++) {
                String cellStr = getCellValue(headerRow, i); // safe for all cell types
                if (cellStr != null && !cellStr.isBlank()) {
                    String raw = cellStr.trim().toLowerCase();
                    // Strip parenthetical unit suffixes, e.g. "Lens Width (mm)" → "lens width"
                    String header = raw.replaceAll("\\s*\\(.*\\)\\s*$", "").trim();
                    colIndex.put(header, i);
                    if (!header.equals(raw)) colIndex.put(raw, i);
                }
            }
            log.info("Detected {} columns from header row: {}", colIndex.size(), colIndex.keySet());

            int fallbackImageIndex = 0;

            while (rows.hasNext()) {
                org.apache.poi.ss.usermodel.Row row = rows.next();
                log.info("Processing Excel row: {}", row.getRowNum());
                try {
                    boolean usedFallback = processImportRow(row, colIndex, cellImageMap, fallbackImages, fallbackImageIndex);
                    if (usedFallback) fallbackImageIndex++;
                } catch (Exception e) {
                    log.error("CRITICAL: Error processing row {}: {}", row.getRowNum(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage(), e);
        }
    }

    private Map<String, byte[]> extractPlaceInCellImages(XSSFWorkbook workbook) {
        Map<String, byte[]> imageMap = new HashMap<>();
        try {
            OPCPackage pkg = workbook.getPackage();
            
            // 1. Try xl/cellimages.xml (Traditional Place in Cell)
            PackagePart cellImagesPart = pkg.getPart(PackagingURIHelper.createPartName("/xl/cellimages.xml"));
            if (cellImagesPart != null) {
                extractFromCellImagesPart(pkg, cellImagesPart, imageMap);
            }

            // 2. Try xl/metadata.xml + RichData (Modern Rich Values approach)
            // If imageMap is still empty or we want to be thorough
            PackagePart metadataPart = pkg.getPart(PackagingURIHelper.createPartName("/xl/metadata.xml"));
            if (metadataPart != null) {
                log.info("Found xl/metadata.xml, attempting to extract rich data images...");
                // Note: RichData extraction is complex and varies. 
                // For now, we'll also check all media parts as a fallback
            }

            // 3. Last Resort Fallback: Map all media files if not already mapped
            // This is useful if the cell contains a reference we can't easily parse but media is there
            if (imageMap.isEmpty()) {
                log.info("No cell-specific mapping found, collecting all workbook pictures...");
                for (org.apache.poi.ss.usermodel.PictureData pic : workbook.getAllPictures()) {
                    String name = pic.suggestFileExtension(); // This isn't a great key, but better than nothing
                    // However, we need a way to link back to the cell.
                }
            }
        } catch (Exception e) {
            log.error("Error extracting Place in Cell images: {}", e.getMessage(), e);
        }
        return imageMap;
    }

    private void extractFromCellImagesPart(OPCPackage pkg, PackagePart part, Map<String, byte[]> imageMap) throws Exception {
        Map<String, byte[]> relIdToData = new HashMap<>();
        for (PackageRelationship rel : part.getRelationships()) {
            // Resolve relative URI against the cellimages.xml part URI to get absolute OPC path
            java.net.URI resolvedUri = part.getPartName().getURI().resolve(rel.getTargetURI());
            PackagePart imgPart = null;
            try {
                imgPart = pkg.getPart(PackagingURIHelper.createPartName(resolvedUri.toString()));
            } catch (Exception e) {
                // Fallback: try constructing path from /xl/ prefix
                try {
                    imgPart = pkg.getPart(PackagingURIHelper.createPartName("/xl/" + rel.getTargetURI()));
                } catch (Exception ignored) {}
            }
            if (imgPart != null) {
                try (InputStream is = imgPart.getInputStream()) {
                    relIdToData.put(rel.getId(), is.readAllBytes());
                }
            }
        }

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(part.getInputStream());
        
        NodeList cellImageList = doc.getElementsByTagNameNS("*", "cellImage");
        for (int i = 0; i < cellImageList.getLength(); i++) {
            Element cellImage = (Element) cellImageList.item(i);
            NodeList nvPicPrList = cellImage.getElementsByTagNameNS("*", "cNvPr");
            if (nvPicPrList.getLength() > 0) {
                String name = ((Element) nvPicPrList.item(0)).getAttribute("name");
                NodeList blipList = cellImage.getElementsByTagNameNS("*", "blip");
                if (blipList.getLength() > 0) {
                    String relId = ((Element) blipList.item(0)).getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed");
                    if (relIdToData.containsKey(relId)) {
                        imageMap.put(name, relIdToData.get(relId));
                        log.debug("Mapped cell image ID: {} to bytes", name);
                    }
                }
            }
        }
    }

    /** Try multiple candidate header names in order; return fallback if none found. */
    private int resolveCol(Map<String, Integer> colIndex, int fallback, String... candidates) {
        for (String key : candidates) {
            Integer idx = colIndex.get(key);
            if (idx != null) return idx;
        }
        // Partial prefix match as last resort
        for (String key : candidates) {
            for (Map.Entry<String, Integer> entry : colIndex.entrySet()) {
                if (entry.getKey().startsWith(key)) return entry.getValue();
            }
        }
        return fallback;
    }

    private boolean processImportRow(org.apache.poi.ss.usermodel.Row row, Map<String, Integer> colIndex,
                                     Map<String, byte[]> cellImageMap, List<byte[]> fallbackImages, int fallbackImageIndex) throws java.io.IOException {
        boolean usedFallback = false;
        String name = getCellValue(row, resolveCol(colIndex, 0, "name"));
        log.info("Row {}: Name='{}'", row.getRowNum(), name);
        if (name == null || name.isBlank()) return usedFallback;

        String slug = getCellValue(row, resolveCol(colIndex, 1, "slug"));
        if (slug == null || slug.isBlank()) slug = slugify(name);
        log.info("Row {}: Slug='{}'", row.getRowNum(), slug);

        String description = getCellValue(row, resolveCol(colIndex, 2, "description"));
        String brandName    = getCellValue(row, resolveCol(colIndex, 3, "brand"));
        String categoryName = getCellValue(row, resolveCol(colIndex, 4, "category"));
        String type         = getCellValue(row, resolveCol(colIndex, 5, "type"));

        BigDecimal basePrice = BigDecimal.ZERO;
        try {
            String s = getCellValue(row, resolveCol(colIndex, 6, "base price"));
            if (s != null && !s.isBlank()) basePrice = new BigDecimal(s);
        } catch (Exception e) {
            log.warn("Invalid base price at row {}", row.getRowNum());
        }

        BigDecimal salePrice = null;
        try {
            String s = getCellValue(row, resolveCol(colIndex, 7, "sale price"));
            if (s != null && !s.isBlank()) salePrice = new BigDecimal(s);
        } catch (Exception e) {
            log.warn("Invalid sale price at row {}", row.getRowNum());
        }

        String gender       = getCellValue(row, resolveCol(colIndex, 8, "gender"));
        String frameMaterial= getCellValue(row, resolveCol(colIndex, 9, "frame material"));
        String frameShape   = getCellValue(row, resolveCol(colIndex, 10, "frame shape"));
        String rimType      = getCellValue(row, resolveCol(colIndex, 11, "rim type"));
        String hingeType    = getCellValue(row, resolveCol(colIndex, 12, "hinge type"));
        String nosePadType  = getCellValue(row, resolveCol(colIndex, 13, "nose pad type"));
        String frameSize    = getCellValue(row, resolveCol(colIndex, 14, "frame size"));
        String style        = getCellValue(row, resolveCol(colIndex, 15, "style"));

        // Physical Spec columns — try multiple aliases
        BigDecimal lensWidth    = parseBigDecimal(getCellValue(row, resolveCol(colIndex, -1, "lens width (mm)", "lens width")));
        BigDecimal bridgeWidth  = parseBigDecimal(getCellValue(row, resolveCol(colIndex, -1, "bridge width (mm)", "bridge width")));
        BigDecimal templeLength = parseBigDecimal(getCellValue(row, resolveCol(colIndex, -1, "temple len (mm)", "temple len", "temple length")));
        BigDecimal weightGram   = parseBigDecimal(getCellValue(row, resolveCol(colIndex, -1, "weight (g)", "weight")));

        // Find or create product
        Product product = productRepository.findBySlug(slug).orElse(null);
        if (product == null) {
            product = new Product();
            product.setSlug(slug);
            product.setIsActive(true);
            product.setIsDeleted(false);
            log.info("Creating new product: {}", name);
        } else {
            log.info("Updating existing product: {}", name);
        }

        product.setName(name);
        product.setDescription(description);
        product.setBasePrice(basePrice);
        product.setSalePrice(salePrice);
        product.setFrameMaterial(frameMaterial);
        product.setFrameShape(frameShape);
        product.setRimType(rimType);
        product.setHingeType(hingeType);
        product.setNosePadType(nosePadType);
        product.setFrameSize(frameSize);
        product.setStyle(style);

        if (type != null) {
            try {
                product.setType(Product.ProductType.valueOf(type.toUpperCase()));
            } catch (Exception e) {
                product.setType(Product.ProductType.FRAME);
                log.warn("Invalid product type '{}', defaulting to FRAME", type);
            }
        }
        if (gender != null) {
            try {
                product.setGender(Product.Gender.valueOf(gender.toUpperCase()));
            } catch (Exception e) {
                product.setGender(Product.Gender.UNISEX);
                log.warn("Invalid gender '{}', defaulting to UNISEX", gender);
            }
        }

        if (brandName != null) {
            final String fb = brandName;
            Brand brand = brandRepository.findByName(fb)
                    .orElseGet(() -> brandRepository.save(Brand.builder().name(fb).slug(slugify(fb)).build()));
            product.setBrand(brand);
        }
        if (categoryName != null) {
            final String fc = categoryName;
            Category category = categoryRepository.findByName(fc)
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(fc).slug(slugify(fc)).build()));
            product.setCategory(category);
        }

        log.info("Step 1: Saving product...");
        product = productRepository.save(product);
        log.info("Step 1 done. Product ID: {}", product.getId());

        // Save ProductSpec if any spec value was provided
        if (lensWidth != null || bridgeWidth != null || templeLength != null || weightGram != null) {
            final Product savedProduct = product;
            ProductSpec spec = productSpecRepository.findById(product.getId())
                    .orElseGet(() -> {
                        ProductSpec s = new ProductSpec();
                        s.setProduct(savedProduct);
                        return s;
                    });
            if (lensWidth != null)    spec.setLensWidth(lensWidth);
            if (bridgeWidth != null)  spec.setBridgeWidth(bridgeWidth);
            if (templeLength != null) spec.setTempleLength(templeLength);
            if (weightGram != null)   spec.setWeightGram(weightGram);
            productSpecRepository.save(spec);
            log.info("Step 1b: ProductSpec saved for product {}", product.getId());
        }

        // Variant info — use resolveCol with template-specific aliases
        String sku      = getCellValue(row, resolveCol(colIndex, 16, "sku (*)", "sku"));
        String colorName= getCellValue(row, resolveCol(colIndex, 17, "color name"));
        String colorHex = getCellValue(row, resolveCol(colIndex, 18, "color hex"));
        String rawStock = getCellValue(row, resolveCol(colIndex, 19, "initial stock", "stock", "qty", "quantity"));
        log.info("Step 2: Variant Info - SKU='{}', Color='{}', Stock='{}'", sku, colorName, rawStock);

        if (sku != null && !sku.isBlank()) {
            int initialStock = 0;
            try {
                initialStock = (int) Double.parseDouble(rawStock != null ? rawStock : "0");
            } catch (Exception e) {
                log.warn("Invalid stock value '{}' at row {}, defaulting to 0", rawStock, row.getRowNum());
            }

            ProductVariant variant = variantRepository.findBySku(sku).orElse(null);
            if (variant == null) {
                variant = new ProductVariant();
                variant.setSku(sku);
                variant.setProduct(product);
                log.info("Step 3: Creating new variant for SKU: {}", sku);
            } else {
                log.info("Step 3: Updating existing variant for SKU: {}", sku);
            }
            variant.setColorName(colorName != null ? colorName : "Default");
            variant.setColorHex(colorHex != null ? colorHex : "#000000");

            // Handle image: try DISPIMG formula first, then fallback
            String imageRef = getCellValue(row, resolveCol(colIndex, 20, "thumbnail url [ab]", "thumbnail url [ab] (*)", "image url", "image"));
            log.info("Step 4: Image Reference = '{}'", imageRef);

            if (imageRef != null && (imageRef.startsWith("http://") || imageRef.startsWith("https://"))) {
                // Direct URL in cell — use as-is (already hosted)
                variant.setImageUrl(imageRef);
                log.info("Step 5: Direct URL image set: {}", imageRef);
            } else {
                if (imageRef != null && imageRef.contains("DISPIMG(\"")) {
                    int start = imageRef.indexOf("(\"") + 2;
                    int end = imageRef.indexOf("\",", start);
                    if (end > start) {
                        imageRef = imageRef.substring(start, end);
                        log.info("Step 4: Parsed image ID from formula: {}", imageRef);
                    }
                }

                if (imageRef != null && !imageRef.isBlank() && cellImageMap.containsKey(imageRef)) {
                    log.info("Step 5: Image found in cell map. Uploading...");
                    byte[] imageData = cellImageMap.get(imageRef);
                    String imageUrl = cloudinaryService.uploadBytes(imageData, "import_" + sku + ".jpg");
                    variant.setImageUrl(imageUrl);
                    log.info("Step 5 done: Image uploaded: {}", imageUrl);
                } else {
                    log.info("Step 5 skip: No matching cell image for ref '{}'", imageRef);
                    if (fallbackImageIndex < fallbackImages.size()) {
                        log.info("Step 5 fallback: Using sequential fallback image index {}", fallbackImageIndex);
                        byte[] imageData = fallbackImages.get(fallbackImageIndex);
                        String imageUrl = cloudinaryService.uploadBytes(imageData, "import_" + sku + "_fb.jpg");
                        variant.setImageUrl(imageUrl);
                        log.info("Step 5 done (fallback): Image uploaded: {}", imageUrl);
                        usedFallback = true;
                    }
                }
            }

            variant = variantRepository.save(variant);
            log.info("Step 6: Variant saved with ID: {}", variant.getId());

            ProductVariant finalVariant = variant;
            InventoryStock stock = inventoryStockRepository.findByProductVariantId(variant.getId())
                    .orElseGet(() -> InventoryStock.builder().productVariant(finalVariant).quantityOnHand(0).build());
            stock.setQuantityOnHand(initialStock);
            inventoryStockRepository.save(stock);
            log.info("Step 7: Stock updated to {}", initialStock);
        } else {
            log.warn("Step 2 skip: SKU is blank for product {}", name);
        }
        return usedFallback;
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String getCellValue(org.apache.poi.ss.usermodel.Row row, int cellIndex) {
        if (cellIndex < 0) return null;
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    private String slugify(String input) {
        if (input == null) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        String result = normalized.replaceAll("\\p{M}", "");
        return result.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");
    }

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
                inStock, stockQuantity, null, 0,
                (p.getVariants() != null && !p.getVariants().isEmpty()) ? p.getVariants().get(0).getId() : null,
                p.getCreatedAt(),
                p.getShowOriginalPrice() != null ? p.getShowOriginalPrice() : false,
                p.getShowSalePrice() != null ? p.getShowSalePrice() : true,
                p.getShowDiscountBadge() != null ? p.getShowDiscountBadge() : true,
                p.getPriceDisplayOverridden() != null ? p.getPriceDisplayOverridden() : false);
    }
}
