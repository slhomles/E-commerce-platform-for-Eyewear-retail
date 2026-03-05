-- Flyway Migration: V7__create_cart_voucher_tables.sql
-- Creates tables for Cart & Voucher modules

-- ==========================================
-- Carts Table (1 user = 1 cart)
-- ==========================================
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    voucher_code VARCHAR(50) NULL COMMENT 'Mã voucher đang áp dụng',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_cart_user (user_id),

    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Giỏ hàng — mỗi user có 1 cart';

-- ==========================================
-- Cart Items Table
-- ==========================================
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    product_variant_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_cart_item_variant (cart_id, product_variant_id),
    INDEX idx_cart_items_cart (cart_id),

    CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_ci_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Các item trong giỏ hàng';

-- ==========================================
-- Vouchers Table
-- ==========================================
CREATE TABLE vouchers (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL COMMENT 'Mã voucher (VD: SALE20)',
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL COMMENT 'PERCENTAGE, FIXED_AMOUNT',
    discount_value DECIMAL(19, 4) NOT NULL COMMENT 'Giá trị giảm (% hoặc số tiền)',
    min_order_amount DECIMAL(19, 4) DEFAULT 0 COMMENT 'Giá trị đơn tối thiểu',
    max_discount_amount DECIMAL(19, 4) NULL COMMENT 'Giảm tối đa (cho loại %)',
    usage_limit INT NULL COMMENT 'Tổng số lần sử dụng tối đa',
    used_count INT DEFAULT 0,
    start_date DATETIME(6) NOT NULL,
    end_date DATETIME(6) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_voucher_code (code),
    INDEX idx_voucher_active (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng voucher khuyến mãi';

-- ==========================================
-- User Addresses Table
-- ==========================================
CREATE TABLE user_addresses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL COMMENT 'Tỉnh/Thành phố (mapping → city in API)',
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL COMMENT 'Số nhà, tên đường (mapping → street in API)',
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    INDEX idx_addr_user (user_id),

    CONSTRAINT fk_addr_users FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sổ địa chỉ giao hàng của người dùng';
