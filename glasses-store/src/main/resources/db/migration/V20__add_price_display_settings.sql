-- V20: Thêm cài đặt hiển thị giá trên card sản phẩm
INSERT INTO site_settings (setting_key, setting_value, description, min_value, max_value) VALUES
('show_original_price', 'true', 'Hiển thị giá gốc (gạch ngang) trên card sản phẩm', NULL, NULL),
('show_sale_price',     'true', 'Hiển thị giá khuyến mãi trên card sản phẩm',        NULL, NULL),
('show_discount_badge', 'true', 'Hiển thị nhãn % giảm giá trên card sản phẩm',       NULL, NULL);
