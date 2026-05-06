-- V12: Enhance voucher system with per-user limits, targeting, and usage tracking

-- 1. Add new columns to vouchers table
ALTER TABLE vouchers
    ADD COLUMN per_user_limit INT NULL COMMENT 'Max uses per individual user (NULL = unlimited)',
    ADD COLUMN applicable_to VARCHAR(20) NOT NULL DEFAULT 'ALL' COMMENT 'ALL, CATEGORY, or PRODUCT';

-- 2. Create voucher_usages table to track who used which voucher
CREATE TABLE IF NOT EXISTS voucher_usages (
    id VARCHAR(36) NOT NULL,
    voucher_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NULL,
    used_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_vu_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    CONSTRAINT fk_vu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vu_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_vu_voucher (voucher_id),
    INDEX idx_vu_user (user_id),
    INDEX idx_vu_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create voucher_applicable_items table for category/product targeting
CREATE TABLE IF NOT EXISTS voucher_applicable_items (
    id VARCHAR(36) NOT NULL,
    voucher_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(20) NOT NULL COMMENT 'CATEGORY or PRODUCT',
    item_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_vai_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_vai (voucher_id, item_type, item_id),
    INDEX idx_vai_voucher (voucher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
