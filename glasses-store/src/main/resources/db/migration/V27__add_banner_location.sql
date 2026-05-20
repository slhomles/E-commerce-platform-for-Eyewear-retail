-- Thêm cột display_location vào bảng banners
ALTER TABLE banners
    ADD COLUMN display_location VARCHAR(50) DEFAULT 'HOME';
