-- Cập nhật bảng banners để hỗ trợ tuỳ chỉnh hiển thị text cho Banner
ALTER TABLE banners
    ADD COLUMN horizontal_alignment VARCHAR(20) DEFAULT 'LEFT',
    ADD COLUMN vertical_alignment VARCHAR(20) DEFAULT 'BOTTOM',
    ADD COLUMN title_font_size INT DEFAULT 36,
    ADD COLUMN subtitle_font_size INT DEFAULT 18,
    ADD COLUMN font_family VARCHAR(100) DEFAULT '''Tajawal'', Helvetica, Arial, sans-serif';
