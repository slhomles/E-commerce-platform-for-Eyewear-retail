-- V23: Sửa default show_original_price = 0 và reset tất cả sản phẩm về đúng trạng thái ban đầu
-- show_original_price mặc định OFF, show_sale_price + show_discount_badge mặc định ON
ALTER TABLE products
  ALTER COLUMN show_original_price SET DEFAULT 0;

UPDATE products
  SET show_original_price     = 0,
      show_sale_price         = 1,
      show_discount_badge     = 1,
      price_display_overridden = 0;
