-- V21: Thêm cài đặt hiển thị giá riêng cho từng sản phẩm
ALTER TABLE products
  ADD COLUMN show_original_price TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN show_sale_price     TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN show_discount_badge TINYINT(1) NOT NULL DEFAULT 1;
