-- V25: Thêm PAYOS vào danh sách phương thức thanh toán hợp lệ
-- MySQL lưu enum dưới dạng VARCHAR nên không cần ALTER TABLE,
-- nhưng migration này xác nhận rõ ràng việc thêm giá trị PAYOS.

-- Cập nhật các đơn hàng cũ có payment_method NULL để tránh lỗi
UPDATE orders
SET payment_method = 'COD'
WHERE payment_method IS NULL;

-- Log thông tin
SELECT 'PayOS payment method support added' AS migration_note;
