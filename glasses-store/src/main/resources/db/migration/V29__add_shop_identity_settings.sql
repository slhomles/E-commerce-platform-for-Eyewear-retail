-- Migration V29: Thêm cấu hình Shop Identity, Logo, Favicon và thông tin Footer liên hệ
INSERT INTO site_settings (setting_key, setting_value, description, min_value, max_value) VALUES
('shop_name', 'Salinaka', 'Tên hiển thị của cửa hàng', NULL, NULL),
('shop_logo_url', '/images/logo-full.png', 'Đường dẫn logo của cửa hàng (Header và Footer)', NULL, NULL),
('shop_favicon_url', '/favicon.png', 'Đường dẫn Favicon hiển thị trên tab trình duyệt', NULL, NULL),
('shop_tagline', 'Kính mắt cao cấp chính hãng mang lại phong cách thời thượng cho bạn.', 'Tagline hoặc câu slogan ngắn của cửa hàng', NULL, NULL),
('shop_address', 'Số 96 Phố Định Công, Hoàng Mai, Hà Nội', 'Địa chỉ cửa hàng hiển thị dưới Footer', NULL, NULL),
('shop_phone', '0912 345 678', 'Số điện thoại liên hệ hiển thị dưới Footer', NULL, NULL),
('shop_email', 'contact@salinaka.com', 'Địa chỉ Email hỗ trợ khách hàng', NULL, NULL),
('shop_working_hours', '8:00 - 22:00 (Hàng ngày)', 'Thời gian mở cửa/làm việc của cửa hàng', NULL, NULL),
('shop_facebook_url', 'https://facebook.com', 'Đường dẫn liên kết trang Facebook của cửa hàng', NULL, NULL),
('shop_instagram_url', 'https://instagram.com', 'Đường dẫn liên kết trang Instagram của cửa hàng', NULL, NULL),
('shop_tiktok_url', 'https://tiktok.com', 'Đường dẫn liên kết trang TikTok của cửa hàng', NULL, NULL),
('shop_zalo_url', 'https://zalo.me', 'Đường dẫn liên kết Zalo hỗ trợ khách hàng', NULL, NULL),
('shop_copyright', '© 2026 Salinaka Eyewear. Tất cả quyền được bảo lưu.', 'Dòng chữ bản quyền hiển thị ở chân trang', NULL, NULL);
