-- V15: Tạo bảng site_settings để admin quản lý cấu hình hiển thị sản phẩm
CREATE TABLE site_settings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    min_value   INT DEFAULT NULL,
    max_value   INT DEFAULT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Giá trị mặc định
INSERT INTO site_settings (setting_key, setting_value, description, min_value, max_value) VALUES
('home_featured_count',     '6',  'Số sản phẩm Featured hiển thị ở trang Home',        5, 20),
('home_recommended_count',  '6',  'Số sản phẩm Recommended hiển thị ở trang Home',     5, 20),
('featured_page_count',     '12', 'Số sản phẩm hiển thị trên trang /featured',         5, 20),
('recommended_page_count',  '12', 'Số sản phẩm hiển thị trên trang /recommended',      5, 20),
('shop_page_size',          '12', 'Số sản phẩm mỗi trang trên trang /shop',            5, 20);
