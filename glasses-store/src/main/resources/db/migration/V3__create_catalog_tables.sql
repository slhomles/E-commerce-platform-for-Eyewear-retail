-- Flyway Migration: V3__create_catalog_tables.sql
-- Creates tables for Catalog module: categories, brands, products, product_specs, product_variants

-- ==========================================
-- Categories Table (Hierarchical)
-- ==========================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT,
    parent_id VARCHAR(36) NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_categories_slug (slug),
    INDEX idx_cate_parent (parent_id),

    CONSTRAINT fk_cate_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Danh mục sản phẩm (Kính râm, Gọng kính...)';

-- ==========================================
-- Brands Table
-- ==========================================
CREATE TABLE brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT,
    logo_url TEXT,
    origin_country VARCHAR(100) COMMENT 'Xuất xứ thương hiệu',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_brands_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Products Table
-- ==========================================
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL,
    description LONGTEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'FRAME' COMMENT 'FRAME, LENS, SERVICE',
    base_price DECIMAL(19, 4) NOT NULL COMMENT 'Giá niêm yết',
    sale_price DECIMAL(19, 4) NULL COMMENT 'Giá khuyến mãi',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, OUT_OF_STOCK',

    -- Filter & AI Recommendation attributes
    gender VARCHAR(20) DEFAULT 'UNISEX' COMMENT 'MEN, WOMEN, UNISEX, KIDS',
    frame_material VARCHAR(100) COMMENT 'ACETATE, TITANIUM, METAL, PLASTIC, MIXED',
    frame_shape VARCHAR(50) COMMENT 'Round, Square, Aviator, Cat-eye, Wayfarer...',
    rim_type VARCHAR(20) COMMENT 'FULL_RIM, HALF_RIM, RIMLESS',
    hinge_type VARCHAR(50) COMMENT 'Spring, Standard, Flex...',
    nose_pad_type VARCHAR(50) COMMENT 'Adjustable, Fixed, Integrated...',
    frame_size VARCHAR(5) COMMENT 'S, M, L, XL',
    face_shape_fit JSON COMMENT 'JSON array: ["ROUND","OVAL","SQUARE","HEART","DIAMOND"]',
    style VARCHAR(100) COMMENT 'Vintage, Modern, Classic, Sporty',
    support_prescription BOOLEAN DEFAULT FALSE,
    support_progressive BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    UNIQUE KEY uk_products_slug (slug),
    INDEX idx_products_brand (brand_id),
    INDEX idx_products_category (category_id),
    INDEX idx_products_gender (gender),
    INDEX idx_products_type (type),
    INDEX idx_products_status (status),

    CONSTRAINT fk_prod_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_prod_cate FOREIGN KEY (category_id) REFERENCES categories (id),
    FULLTEXT KEY ft_prod_search (name, description, frame_shape)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng chứa thông tin chung của một dòng kính';

-- ==========================================
-- Product Specs Table (1-1 with Product)
-- ==========================================
CREATE TABLE product_specs (
    product_id VARCHAR(36) NOT NULL,
    lens_width DECIMAL(5,2) COMMENT 'Chiều rộng mắt kính (mm)',
    bridge_width DECIMAL(5,2) COMMENT 'Chiều rộng cầu mũi (mm)',
    temple_length DECIMAL(5,2) COMMENT 'Chiều dài càng kính (mm)',
    lens_height DECIMAL(5,2) COMMENT 'Chiều cao mắt kính (mm)',
    frame_width DECIMAL(5,2) COMMENT 'Tổng chiều rộng kính (mm)',
    weight_gram DECIMAL(6,2) COMMENT 'Trọng lượng (gram)',

    PRIMARY KEY (product_id),
    CONSTRAINT fk_specs_prod FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thông số kỹ thuật chi tiết (1-1 với Product)';

-- ==========================================
-- Product Variants Table
-- ==========================================
CREATE TABLE product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    sku VARCHAR(50) NOT NULL COMMENT 'Mã quản lý kho (VD: RB-3025-BLK)',
    color_name VARCHAR(50) NOT NULL COMMENT 'Tên màu (Black Matte, Gold...)',
    color_hex VARCHAR(20) COMMENT 'Mã màu UI (#000000)',
    image_url TEXT COMMENT 'Ảnh đại diện của màu này',
    image_gallery JSON COMMENT 'Mảng JSON chứa các URL ảnh',
    price_adjustment DECIMAL(19, 4) DEFAULT 0 COMMENT 'Giá chênh lệch so với base_price',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_variants_sku (sku),
    INDEX idx_variants_product (product_id),

    CONSTRAINT fk_var_prod FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Biến thể sản phẩm (Màu sắc)';
