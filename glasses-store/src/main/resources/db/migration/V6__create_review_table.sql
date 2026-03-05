-- Flyway Migration: V6__create_review_table.sql
-- Creates table for Review module (Social Proof)

CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL COMMENT 'Đảm bảo đã mua mới được review',
    rating TINYINT NOT NULL COMMENT '1 đến 5 sao',
    content TEXT COMMENT 'Nội dung review',
    images JSON COMMENT 'Ảnh khách chụp thực tế',
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE KEY uk_review_order_prod (order_id, product_id),
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),

    CONSTRAINT fk_rev_prod FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_rev_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Đánh giá sản phẩm - Social Proof';
