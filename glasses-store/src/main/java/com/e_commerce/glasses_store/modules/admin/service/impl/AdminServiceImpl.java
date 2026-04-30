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
                var searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.join("category").get("name")), pattern),
                        cb.like(cb.lower(root.join("brand").get("name")), pattern)
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
                // Sort by name to ensure sequential mapping (image1, image2)
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
            org.apache.poi.ss.usermodel.Row headerRow = rows.next(); // Skip header row

            int fallbackImageIndex = 0;

            while (rows.hasNext()) {
                org.apache.poi.ss.usermodel.Row row = rows.next();
                log.info("Processing Excel row: {}", row.getRowNum());
                try {
                    boolean usedFallback = processImportRow(row, cellImageMap, fallbackImages, fallbackImageIndex);
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
            PackagePart imgPart = pkg.getPart(PackagingURIHelper.createPartName("/xl/" + rel.getTargetURI()));
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

    private boolean processImportRow(org.apache.poi.ss.usermodel.Row row, Map<String, byte[]> cellImageMap, List<byte[]> fallbackImages, int fallbackImageIndex) throws java.io.IOException {
        boolean usedFallback = false;
        String name = getCellValue(row, 0);
        log.info("Row {}: Name='{}'", row.getRowNum(), name);
        if (name == null || name.isBlank()) return usedFallback;

        String slug = getCellValue(row, 1);
        if (slug == null || slug.isBlank()) slug = slugify(name);
        log.info("Row {}: Slug='{}'", row.getRowNum(), slug);

        String description = getCellValue(row, 2);
        String brandName = getCellValue(row, 3);
        String categoryName = getCellValue(row, 4);
        String type = getCellValue(row, 5);
        BigDecimal basePrice = BigDecimal.ZERO;
        try {
            String basePriceStr = getCellValue(row, 6);
            if (basePriceStr != null && !basePriceStr.isBlank()) {
                basePrice = new BigDecimal(basePriceStr);
            }
        } catch (Exception e) {
            log.warn("Invalid base price at row {}: {}", row.getRowNum(), getCellValue(row, 6));
        }

        BigDecimal salePrice = null;
        try {
            String salePriceStr = getCellValue(row, 7);
            if (salePriceStr != null && !salePriceStr.isBlank()) {
                salePrice = new BigDecimal(salePriceStr);
            }
        } catch (Exception e) {
            log.warn("Invalid salePrice at row {}: {}", row.getRowNum(), getCellValue(row, 7));
        }
        String gender = getCellValue(row, 8);
        String frameMaterial = getCellValue(row, 9);
        String frameShape = getCellValue(row, 10);
        String rimType = getCellValue(row, 11);
        String hingeType = getCellValue(row, 12);
        String nosePadType = getCellValue(row, 13);
        String frameSize = getCellValue(row, 14);
        String style = getCellValue(row, 15);
        
        // Find or create product
        Product product = productRepository.findBySlug(slug).orElse(null);
        if (product == null) {
            product = new Product();
            product.setSlug(slug);
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

        // Brand & Category
        if (brandName != null) {
            final String finalBrandName = brandName;
            Brand brand = brandRepository.findByName(brandName)
                    .orElseGet(() -> brandRepository.save(Brand.builder().name(finalBrandName).slug(slugify(finalBrandName)).build()));
            product.setBrand(brand);
        }
        if (categoryName != null) {
            final String finalCatName = categoryName;
            Category category = categoryRepository.findByName(categoryName)
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(finalCatName).slug(slugify(finalCatName)).build()));
            product.setCategory(category);
        }

        log.info("Step 1: Saving product...");
        product = productRepository.save(product);
        log.info("Step 1 done. Product ID: {}", product.getId());

        // Variant info
        String sku = getCellValue(row, 16);
        String colorName = getCellValue(row, 17);
        String colorHex = getCellValue(row, 18);
        String rawStock = getCellValue(row, 19);
        log.info("Step 2: Variant Info - SKU='{}', Color='{}', Stock='{}'", sku, colorName, rawStock);

        if (sku != null && !sku.isBlank()) {
            int initialStock = (int) Double.parseDouble(rawStock != null ? rawStock : "0");
            ProductVariant variant = variantRepository.findBySku(sku).orElse(null);
            if (variant == null) {
                variant = new ProductVariant();
                variant.setSku(sku);
                variant.setProduct(product);
                log.info("Step 3: Creating new variant for SKU: {}", sku);
            } else {
                log.info("Step 3: Updating existing variant for SKU: {}", sku);
            }
            variant.setColorName(colorName);
            variant.setColorHex(colorHex);

            // Handle Place in Cell Image (defaulting to column U - index 20)
            String imageRef = getCellValue(row, 20);
            log.info("Step 4: Image Reference = '{}'", imageRef);

            // If it's a formula like DISPIMG("ID_1",1), extract "ID_1"
            if (imageRef != null && imageRef.contains("DISPIMG(\"")) {
                int start = imageRef.indexOf("(\"") + 2;
                int end = imageRef.indexOf("\",", start);
                if (end > start) {
                    imageRef = imageRef.substring(start, end);
                    log.info("Step 4: Parsed image ID from formula: {}", imageRef);
                }
            }
            
            if (imageRef != null && !imageRef.isBlank() && cellImageMap.containsKey(imageRef)) {
                log.info("Step 5: Image found in map. Uploading to Cloudinary...");
                byte[] imageData = cellImageMap.get(imageRef);
                String imageUrl = cloudinaryService.uploadBytes(imageData, "import_" + sku + ".jpg");
                variant.setImageUrl(imageUrl);
                log.info("Step 5 completion: Image uploaded: {}", imageUrl);
            } else {
                log.info("Step 5 skip: No matching image for ref '{}'", imageRef);
                if (fallbackImageIndex < fallbackImages.size()) {
                    log.info("Step 5 fallback: Using sequential fallback image index {}", fallbackImageIndex);
                    byte[] imageData = fallbackImages.get(fallbackImageIndex);
                    String imageUrl = cloudinaryService.uploadBytes(imageData, "import_" + sku + "_fb.jpg");
                    variant.setImageUrl(imageUrl);
                    log.info("Step 5 completion (fallback): Image uploaded: {}", imageUrl);
                    usedFallback = true;
                }
            }

            variant = variantRepository.save(variant);
            log.info("Step 6: Variant saved with ID: {}", variant.getId());

            // Stock
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

    private String getCellValue(org.apache.poi.ss.usermodel.Row row, int cellIndex) {
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
                p.getCreatedAt());
    }
}
