-- V22: Thêm flag đánh dấu sản phẩm đã được cấu hình giá riêng
-- Khi = 1: global settings không ảnh hưởng sản phẩm này nữa
ALTER TABLE products
  ADD COLUMN price_display_overridden TINYINT(1) NOT NULL DEFAULT 0;
