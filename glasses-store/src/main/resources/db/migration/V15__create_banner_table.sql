-- =============================================
-- V12: Banner Management Table
-- Quản lý banner quảng cáo tương tác
-- =============================================

CREATE TABLE banners (
    id          VARCHAR(36)   PRIMARY KEY,
    title       VARCHAR(255)  NOT NULL COMMENT 'Tên banner (admin dùng nội bộ)',
    subtitle    VARCHAR(500)  NULL COMMENT 'Phụ đề hiển thị trên banner',
    image_url   VARCHAR(1000) NOT NULL COMMENT 'URL ảnh banner (Cloudinary)',
    link_type   ENUM('PRODUCT','CATEGORY','CUSTOM_URL') NOT NULL DEFAULT 'CUSTOM_URL'
                COMMENT 'Loại liên kết: sản phẩm, danh mục, hoặc URL tùy chỉnh',
    link_value  VARCHAR(500)  NOT NULL COMMENT 'productId | categoryId | custom path',
    position    INT           NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị (nhỏ = trước)',
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    start_date  DATETIME      NOT NULL COMMENT 'Thời điểm bắt đầu hiển thị',
    end_date    DATETIME      NOT NULL COMMENT 'Thời điểm hết hạn',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_banners_active_date (is_active, start_date, end_date),
    INDEX idx_banners_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
