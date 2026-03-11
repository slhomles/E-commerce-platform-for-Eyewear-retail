-- V8__insert_dummy_product_data.sql
-- Thêm 10 sản phẩm mẫu (cùng thương hiệu, danh mục, thông số và phiên bản) để test API

-- Thêm 2 Thương hiệu (Brands)
INSERT IGNORE INTO brands (id, name, slug, description, origin_country, created_at) VALUES 
('b0000000-0000-0000-0000-000000000001', 'Ray-Ban', 'ray-ban', 'Thương hiệu kính râm nổi tiếng thế giới.', 'Italy', NOW()),
('b0000000-0000-0000-0000-000000000002', 'Oakley', 'oakley', 'Kính thể thao chống UV chuyên nghiệp.', 'USA', NOW());

-- Thêm 2 Danh mục (Categories)
INSERT IGNORE INTO categories (id, name, slug, description, parent_id, created_at) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Sunglasses', 'sunglasses', 'Kính râm thời trang', NULL, NOW()),
('c0000000-0000-0000-0000-000000000002', 'Sports Glasses', 'sports-glasses', 'Kính thể thao', NULL, NOW());

-- Thêm 10 Sản phẩm (Products)
INSERT IGNORE INTO products (id, brand_id, category_id, name, slug, description, type, base_price, sale_price, gender, frame_material, frame_shape, rim_type, status, created_at) VALUES 
('p0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ray-Ban Aviator Classic', 'ray-ban-aviator-classic', 'Kính phi công huyền thoại.', 'FRAME', 4500000.0, 4000000.0, 'UNISEX', 'METAL', 'Aviator', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ray-Ban Wayfarer Classic', 'ray-ban-wayfarer-classic', 'Phong cách Wayfarer sành điệu.', 'FRAME', 3800000.0, 3500000.0, 'UNISEX', 'ACETATE', 'Wayfarer', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ray-Ban Clubmaster', 'ray-ban-clubmaster', 'Thiết kế nửa gọng độc đáo.', 'FRAME', 4200000.0, NULL, 'UNISEX', 'MIXED', 'Clubmaster', 'HALF_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ray-Ban Round Metal', 'ray-ban-round-metal', 'Gọng tròn hoài cổ retro.', 'FRAME', 4000000.0, 3800000.0, 'UNISEX', 'METAL', 'Round', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ray-Ban Justin', 'ray-ban-justin', 'Thiết kế nam tính, mạnh mẽ.', 'FRAME', 3500000.0, NULL, 'MEN', 'PLASTIC', 'Rectangle', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Oakley Radar EV Path', 'oakley-radar-ev-path', 'Kính thể thao đỉnh cao cho đạp xe.', 'FRAME', 5500000.0, 5000000.0, 'MEN', 'PLASTIC', 'Sport', 'HALF_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Oakley Sutro', 'oakley-sutro', 'Mang phong cách thành phố, bản lớn.', 'FRAME', 4800000.0, NULL, 'UNISEX', 'PLASTIC', 'Shield', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Oakley Holbrook', 'oakley-holbrook', 'Kính râm hàng ngày mang bản sắc Mỹ.', 'FRAME', 3900000.0, 3500000.0, 'MEN', 'PLASTIC', 'Square', 'FULL_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Oakley Flak 2.0 XL', 'oakley-flak-2-0-xl', 'Phủ sóng tiêu chuẩn một cách tối ưu.', 'FRAME', 4600000.0, NULL, 'UNISEX', 'PLASTIC', 'Sport', 'HALF_RIM', 'ACTIVE', NOW()),
('p0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Oakley Frogskins', 'oakley-frogskins', 'Sự quay trở lại của văn hóa 80s.', 'FRAME', 3200000.0, 2800000.0, 'UNISEX', 'PLASTIC', 'Wayfarer', 'FULL_RIM', 'ACTIVE', NOW());

-- Thêm 10 Thông số Sản phẩm (Product Specs)
INSERT IGNORE INTO product_specs (product_id, lens_width, bridge_width, temple_length, lens_height, frame_width, weight_gram) VALUES 
('p0000000-0000-0000-0000-000000000001', 58.0, 14.0, 135.0, 50.0, 140.0, 30.5),
('p0000000-0000-0000-0000-000000000002', 50.0, 22.0, 150.0, 41.0, 143.0, 40.0),
('p0000000-0000-0000-0000-000000000003', 51.0, 21.0, 145.0, 43.0, 144.0, 35.0),
('p0000000-0000-0000-0000-000000000004', 50.0, 21.0, 145.0, 47.0, 130.0, 25.0),
('p0000000-0000-0000-0000-000000000005', 54.0, 16.0, 145.0, 44.0, 138.0, 33.0),
('p0000000-0000-0000-0000-000000000006', 138.0, 0.0, 128.0, 50.0, 145.0, 28.0),
('p0000000-0000-0000-0000-000000000007', 137.0, 0.0, 140.0, 56.0, 145.0, 32.0),
('p0000000-0000-0000-0000-000000000008', 55.0, 18.0, 137.0, 43.0, 140.0, 30.0),
('p0000000-0000-0000-0000-000000000009', 59.0, 12.0, 133.0, 38.0, 135.0, 26.0),
('p0000000-0000-0000-0000-000000000010', 54.0, 17.0, 133.0, 43.0, 138.0, 22.0);

-- Thêm các Biến thể (Product Variants)
INSERT IGNORE INTO product_variants (id, product_id, sku, color_name, color_hex, image_url, image_gallery, price_adjustment, created_at) VALUES 
('v0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'RB-AV-01-GLD', 'Vàng/Xanh lá', '#D4AF37', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'RB-AV-01-BLK', 'Đen', '#000000', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500', '[]', 200000, NOW()),
('v0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000002', 'RB-WF-01-TRT', 'Đồi mồi', '#5a3d30', 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000003', 'RB-CM-01-BLK', 'Đen/Vàng', '#000000', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000004', 'RB-RM-01-SLV', 'Bạc', '#C0C0C0', 'https://images.unsplash.com/photo-1483412033650-1015dce15911?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000006', 'OK-RE-01-RED', 'Tím Neon', '#C1FF00', 'https://images.unsplash.com/photo-1589713430154-1fc6ae14aee1?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000007', 'OK-SU-01-WHT', 'Trắng nhám', '#FFFFFF', 'https://images.unsplash.com/photo-1625805866449-34dc3878ad13?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000008', 'OK-HB-01-BLK', 'Đen nhám', '#222222', 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000009', 'OK-FL-01-BLU', 'Xanh kim loại', '#4682B4', 'https://images.unsplash.com/photo-1614713568396-d4f1076b3353?w=500', '[]', 0, NOW()),
('v0000000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000010', 'OK-FS-01-CLR', 'Trong suốt', '#F0F8FF', 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500', '[]', 0, NOW());
