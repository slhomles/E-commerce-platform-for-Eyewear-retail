-- Flyway Migration: V4__create_inventory_tables.sql
-- Creates table for Inventory module

CREATE TABLE inventory_stocks (
    id VARCHAR(36) PRIMARY KEY,
    product_variant_id VARCHAR(36) NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0 COMMENT 'Tổng số lượng trong kho',
    quantity_reserved INT NOT NULL DEFAULT 0 COMMENT 'Số lượng khách đang giữ trong giỏ/đơn chưa thanh toán',
    warehouse_location VARCHAR(100) COMMENT 'Vị trí kệ kho',
    version BIGINT DEFAULT 0 COMMENT 'Optimistic Locking',
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uk_inv_variant (product_variant_id),

    CONSTRAINT fk_inv_var FOREIGN KEY (product_variant_id) REFERENCES product_variants (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quản lý tồn kho theo variant';
