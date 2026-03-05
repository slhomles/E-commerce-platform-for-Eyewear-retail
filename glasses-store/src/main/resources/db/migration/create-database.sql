-- =============================================
-- DATABASE SCHEMA REFERENCE - EYEWEAR E-COMMERCE
-- Standard: MySQL 8.0, UUID, Soft Delete, Audit
-- Datetime: DATETIME(6) (microsecond precision)
-- Charset:  utf8mb4_unicode_ci
-- =============================================
-- NOTE: Đây là file THAM CHIẾU toàn bộ schema.
-- Các Flyway migration riêng lẻ (V1, V2, ...) mới là file được thực thi.
-- =============================================

CREATE DATABASE IF NOT EXISTS `eyewear_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `eyewear_db`;

-- =============================================
-- MODULE: USER & AUTH (V1__create_auth_tables.sql)
-- =============================================

CREATE TABLE `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `avatar` VARCHAR(500),
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT 'USER, ADMIN, SUPPORT',
    `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `last_login_at` DATETIME(6) NULL,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lưu trữ thông tin người dùng hệ thống';

CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(36) PRIMARY KEY,
    `token` VARCHAR(500) NOT NULL UNIQUE,
    `user_id` VARCHAR(36) NOT NULL,
    `expiry_date` DATETIME(6) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    INDEX `idx_refresh_tokens_token` (`token`),
    INDEX `idx_refresh_tokens_user_id` (`user_id`),

    CONSTRAINT `fk_refresh_tokens_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `verification_tokens` (
    `id` VARCHAR(36) PRIMARY KEY,
    `token` VARCHAR(500) NOT NULL UNIQUE,
    `user_id` VARCHAR(36) NOT NULL,
    `expiry_date` DATETIME(6) NOT NULL,
    `token_type` VARCHAR(50) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    INDEX `idx_verification_tokens_token` (`token`),
    INDEX `idx_verification_tokens_user_id` (`user_id`),

    CONSTRAINT `fk_verification_tokens_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MODULE: USER ADDRESS
-- =============================================

CREATE TABLE `user_addresses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `recipient_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `province` VARCHAR(100) NOT NULL COMMENT 'Tỉnh/Thành phố (mapping → city in API)',
    `district` VARCHAR(100) NOT NULL,
    `ward` VARCHAR(100) NOT NULL,
    `street` VARCHAR(255) NOT NULL COMMENT 'Số nhà, tên đường (mapping → street in API)',
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    INDEX `idx_addr_user` (`user_id`),

    CONSTRAINT `fk_addr_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sổ địa chỉ giao hàng của người dùng';

-- =============================================
-- MODULE: CATALOG (PRODUCT)
-- =============================================

CREATE TABLE `categories` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT,
    `parent_id` VARCHAR(36) NULL,
    `image_url` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_categories_slug` (`slug`),
    INDEX `idx_cate_parent` (`parent_id`),

    CONSTRAINT `fk_cate_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Danh mục sản phẩm (Kính râm, Gọng kính...)';

CREATE TABLE `brands` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT,
    `logo_url` TEXT,
    `origin_country` VARCHAR(100) COMMENT 'Xuất xứ thương hiệu',
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_brands_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
    `id` VARCHAR(36) PRIMARY KEY,
    `brand_id` VARCHAR(36) NOT NULL,
    `category_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(300) NOT NULL,
    `description` LONGTEXT,
    `type` VARCHAR(20) NOT NULL DEFAULT 'FRAME' COMMENT 'FRAME, LENS, SERVICE — khớp OpenAPI ProductType',
    `base_price` DECIMAL(19, 4) NOT NULL COMMENT 'Giá niêm yết',
    `sale_price` DECIMAL(19, 4) NULL COMMENT 'Giá khuyến mãi (nullable)',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, OUT_OF_STOCK',

    -- Thuộc tính quan trọng cho Filter & AI Recommendation
    `gender` VARCHAR(20) DEFAULT 'UNISEX' COMMENT 'MEN, WOMEN, UNISEX, KIDS',
    `frame_material` VARCHAR(100) COMMENT 'ACETATE, TITANIUM, METAL, PLASTIC, MIXED — khớp OpenAPI Material',
    `frame_shape` VARCHAR(50) COMMENT 'Round, Square, Aviator, Cat-eye, Wayfarer...',
    `rim_type` VARCHAR(20) COMMENT 'FULL_RIM, HALF_RIM, RIMLESS — khớp OpenAPI RimType',
    `hinge_type` VARCHAR(50) COMMENT 'Spring, Standard, Flex...',
    `nose_pad_type` VARCHAR(50) COMMENT 'Adjustable, Fixed, Integrated...',
    `frame_size` VARCHAR(5) COMMENT 'S, M, L, XL — khớp OpenAPI frameSize',
    `face_shape_fit` JSON COMMENT 'Mảng JSON: ["ROUND","OVAL","SQUARE","HEART","DIAMOND"]',
    `style` VARCHAR(100) COMMENT 'Vintage, Modern, Classic, Sporty',
    `support_prescription` BOOLEAN DEFAULT FALSE COMMENT 'Có hỗ trợ kính cận không',
    `support_progressive` BOOLEAN DEFAULT FALSE COMMENT 'Có hỗ trợ đa tròng không',

    `is_active` BOOLEAN DEFAULT TRUE,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),
    `created_by` VARCHAR(100),
    `updated_by` VARCHAR(100),

    UNIQUE KEY `uk_products_slug` (`slug`),
    INDEX `idx_products_brand` (`brand_id`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_gender` (`gender`),
    INDEX `idx_products_type` (`type`),
    INDEX `idx_products_status` (`status`),

    CONSTRAINT `fk_prod_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
    CONSTRAINT `fk_prod_cate` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
    FULLTEXT KEY `ft_prod_search` (`name`, `description`, `frame_shape`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng chứa thông tin chung của một dòng kính';

CREATE TABLE `product_specs` (
    `product_id` VARCHAR(36) NOT NULL,
    -- Thông số kỹ thuật chuẩn Optical (milimet)
    `lens_width` DECIMAL(5,2) COMMENT 'Chiều rộng mắt kính (VD: 54)',
    `bridge_width` DECIMAL(5,2) COMMENT 'Chiều rộng cầu mũi (VD: 18)',
    `temple_length` DECIMAL(5,2) COMMENT 'Chiều dài càng kính (VD: 145)',
    `lens_height` DECIMAL(5,2) COMMENT 'Chiều cao mắt kính',
    `frame_width` DECIMAL(5,2) COMMENT 'Tổng chiều rộng kính',
    `weight_gram` DECIMAL(6,2) COMMENT 'Trọng lượng (gram)',

    PRIMARY KEY (`product_id`),
    CONSTRAINT `fk_specs_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thông số kỹ thuật chi tiết (1-1 với Product)';

CREATE TABLE `product_variants` (
    `id` VARCHAR(36) PRIMARY KEY,
    `product_id` VARCHAR(36) NOT NULL,
    `sku` VARCHAR(50) NOT NULL COMMENT 'Mã quản lý kho (VD: RB-3025-BLK)',
    `color_name` VARCHAR(50) NOT NULL COMMENT 'Tên màu (Black Matte, Gold...)',
    `color_hex` VARCHAR(20) COMMENT 'Mã màu hiển thị UI (#000000)',
    `image_url` TEXT COMMENT 'Ảnh đại diện của màu này',
    `image_gallery` JSON COMMENT 'Mảng JSON chứa các URL ảnh',
    `price_adjustment` DECIMAL(19, 4) DEFAULT 0 COMMENT 'Giá chênh lệch so với base_price',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_variants_sku` (`sku`),
    INDEX `idx_variants_product` (`product_id`),

    CONSTRAINT `fk_var_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Biến thể sản phẩm (Màu sắc)';

-- =============================================
-- MODULE: INVENTORY
-- =============================================

CREATE TABLE `inventory_stocks` (
    `id` VARCHAR(36) PRIMARY KEY,
    `product_variant_id` VARCHAR(36) NOT NULL,
    `quantity_on_hand` INT NOT NULL DEFAULT 0 COMMENT 'Tổng số lượng trong kho',
    `quantity_reserved` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng khách đang giữ',
    `warehouse_location` VARCHAR(100) COMMENT 'Vị trí kệ kho',
    `version` BIGINT DEFAULT 0 COMMENT 'Optimistic Locking',
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY `uk_inv_variant` (`product_variant_id`),
    CONSTRAINT `fk_inv_var` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MODULE: CART & VOUCHER
-- =============================================

CREATE TABLE `carts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `voucher_code` VARCHAR(50) NULL COMMENT 'Mã voucher đang áp dụng',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_cart_user` (`user_id`),
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Giỏ hàng — mỗi user có 1 cart';

CREATE TABLE `cart_items` (
    `id` VARCHAR(36) PRIMARY KEY,
    `cart_id` VARCHAR(36) NOT NULL,
    `product_variant_id` VARCHAR(36) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_cart_item_variant` (`cart_id`, `product_variant_id`),
    INDEX `idx_cart_items_cart` (`cart_id`),

    CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ci_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Các item trong giỏ hàng';

CREATE TABLE `vouchers` (
    `id` VARCHAR(36) PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã voucher (VD: SALE20)',
    `description` VARCHAR(255),
    `discount_type` VARCHAR(20) NOT NULL COMMENT 'PERCENTAGE, FIXED_AMOUNT',
    `discount_value` DECIMAL(19, 4) NOT NULL COMMENT 'Giá trị giảm (% hoặc số tiền)',
    `min_order_amount` DECIMAL(19, 4) DEFAULT 0 COMMENT 'Giá trị đơn tối thiểu',
    `max_discount_amount` DECIMAL(19, 4) NULL COMMENT 'Giảm tối đa (cho loại %)',
    `usage_limit` INT NULL COMMENT 'Tổng số lần sử dụng tối đa',
    `used_count` INT DEFAULT 0,
    `start_date` DATETIME(6) NOT NULL,
    `end_date` DATETIME(6) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_voucher_code` (`code`),
    INDEX `idx_voucher_active` (`is_active`, `start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng voucher khuyến mãi';

-- =============================================
-- MODULE: ORDER
-- =============================================

CREATE TABLE `orders` (
    `id` VARCHAR(36) PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL COMMENT 'Mã đơn hàng hiển thị (VD: ORD-2402-1234)',
    `user_id` VARCHAR(36) NULL COMMENT 'Null nếu mua vãng lai (Guest)',

    -- Thông tin tài chính
    `total_amount` DECIMAL(19, 4) NOT NULL COMMENT 'Tổng tiền hàng',
    `shipping_fee` DECIMAL(19, 4) DEFAULT 0,
    `discount_amount` DECIMAL(19, 4) DEFAULT 0,
    `final_amount` DECIMAL(19, 4) NOT NULL COMMENT 'Khách phải trả',

    -- Trạng thái & Giao vận
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PAID, PACKING, SHIPPING, DELIVERED, CANCELLED',
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT 'UNPAID, PAID, REFUNDED',
    `payment_method` VARCHAR(20) COMMENT 'COD, BANK_TRANSFER, VNPAY — khớp OpenAPI',

    -- Snapshot địa chỉ
    `shipping_address_json` JSON NOT NULL COMMENT 'Snapshot address tại thời điểm đặt hàng',
    `customer_note` TEXT,
    `tracking_number` VARCHAR(100),
    `voucher_code` VARCHAR(50) NULL COMMENT 'Mã voucher đã dùng',

    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6),

    UNIQUE KEY `uk_orders_code` (`code`),
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_created` (`created_at`),

    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
    `id` VARCHAR(36) PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `product_variant_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,

    -- Data Snapshot
    `product_name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(19, 4) NOT NULL COMMENT 'Giá tại thời điểm mua',
    `subtotal` DECIMAL(19, 4) NOT NULL,

    -- Placeholder for V2 Optical Data
    `optical_data_json` JSON NULL COMMENT 'Reserved V2: Lens info + Prescription snapshot',

    INDEX `idx_oi_order` (`order_id`),
    INDEX `idx_oi_product` (`product_id`),

    CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
    CONSTRAINT `fk_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
    CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_status_history` (
    `id` VARCHAR(36) PRIMARY KEY,
    `order_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(20) NOT NULL COMMENT 'Trạng thái tại thời điểm này',
    `note` VARCHAR(500) COMMENT 'Ghi chú (VD: Lý do huỷ)',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_osh_order` (`order_id`),

    CONSTRAINT `fk_osh_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lịch sử trạng thái đơn hàng → API timeline';

-- =============================================
-- MODULE: REVIEW (Social Proof)
-- =============================================

CREATE TABLE `reviews` (
    `id` VARCHAR(36) PRIMARY KEY,
    `product_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `order_id` VARCHAR(36) NOT NULL COMMENT 'Đảm bảo đã mua mới được review',
    `rating` TINYINT NOT NULL COMMENT '1 đến 5 sao',
    `content` TEXT COMMENT 'Nội dung review — khớp OpenAPI field name',
    `images` JSON COMMENT 'Ảnh khách chụp thực tế — khớp OpenAPI field name',
    `is_verified_purchase` BOOLEAN DEFAULT TRUE,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE KEY `uk_review_order_prod` (`order_id`, `product_id`),
    INDEX `idx_reviews_product` (`product_id`),
    INDEX `idx_reviews_user` (`user_id`),

    CONSTRAINT `fk_rev_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    CONSTRAINT `fk_rev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_rev_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MODULE: EVENT PUBLICATION (V2__create_event_publication.sql)
-- Spring Modulith Event Registry
-- =============================================

CREATE TABLE IF NOT EXISTS `event_publication` (
    `id` VARCHAR(36) NOT NULL,
    `listener_id` VARCHAR(512) NOT NULL,
    `event_type` VARCHAR(512) NOT NULL,
    `serialized_event` LONGTEXT NOT NULL,
    `publication_date` DATETIME(6) NOT NULL,
    `completion_date` DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;