-- Flyway Migration: V5__create_order_tables.sql
-- Creates tables for Order module: orders, order_items, order_status_history

-- ==========================================
-- Orders Table
-- ==========================================
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT 'Mã đơn hàng hiển thị (VD: ORD-2402-1234)',
    user_id VARCHAR(36) NULL COMMENT 'Null nếu mua vãng lai (Guest)',

    -- Financial info
    total_amount DECIMAL(19, 4) NOT NULL COMMENT 'Tổng tiền hàng',
    shipping_fee DECIMAL(19, 4) DEFAULT 0,
    discount_amount DECIMAL(19, 4) DEFAULT 0,
    final_amount DECIMAL(19, 4) NOT NULL COMMENT 'Khách phải trả',

    -- Status & Shipping
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PAID, PACKING, SHIPPING, DELIVERED, CANCELLED',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT 'UNPAID, PAID, REFUNDED',
    payment_method VARCHAR(20) COMMENT 'COD, BANK_TRANSFER, VNPAY',

    -- Address snapshot
    shipping_address_json JSON NOT NULL COMMENT 'Snapshot address tại thời điểm đặt hàng',
    customer_note TEXT,
    tracking_number VARCHAR(100),
    voucher_code VARCHAR(50) NULL COMMENT 'Mã voucher đã dùng',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6),

    UNIQUE KEY uk_orders_code (code),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),

    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Order Items Table
-- ==========================================
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_variant_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,

    -- Data Snapshot
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(19, 4) NOT NULL COMMENT 'Giá tại thời điểm mua',
    subtotal DECIMAL(19, 4) NOT NULL,

    -- V2 placeholder
    optical_data_json JSON NULL COMMENT 'Reserved V2: Lens info + Prescription snapshot',

    INDEX idx_oi_order (order_id),
    INDEX idx_oi_product (product_id),

    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants (id),
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Order Status History (Timeline)
-- ==========================================
CREATE TABLE order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL COMMENT 'Trạng thái tại thời điểm này',
    note VARCHAR(500) COMMENT 'Ghi chú (VD: Lý do huỷ)',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX idx_osh_order (order_id),

    CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lịch sử trạng thái đơn hàng — phục vụ API timeline';
