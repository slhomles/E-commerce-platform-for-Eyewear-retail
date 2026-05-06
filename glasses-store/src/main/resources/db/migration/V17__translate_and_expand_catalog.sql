-- =============================================
-- V14: Translate existing data to English
--      + Add 5 new product categories
-- =============================================

-- ─── Translate brand descriptions ────────────────────────────────────────────
UPDATE brands SET description = 'World-renowned sunglasses brand, iconic since 1937.'
WHERE id = 'b0000000-0000-0000-0000-000000000001';

UPDATE brands SET description = 'Professional sport-performance eyewear with superior UV protection.'
WHERE id = 'b0000000-0000-0000-0000-000000000002';

-- ─── Translate category descriptions ─────────────────────────────────────────
UPDATE categories SET description = 'Fashion sunglasses with UV protection for everyday style.'
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE categories SET description = 'High-performance sport glasses for active lifestyles.'
WHERE id = 'c0000000-0000-0000-0000-000000000002';

-- ─── Translate product descriptions ──────────────────────────────────────────
UPDATE products SET description = 'The legendary aviator frame, a timeless classic since 1937.'
WHERE id = 'p0000000-0000-0000-0000-000000000001';

UPDATE products SET description = 'Timeless Wayfarer silhouette that defined street style for decades.'
WHERE id = 'p0000000-0000-0000-0000-000000000002';

UPDATE products SET description = 'Distinctive browline design with a half-rim acetate top and metal bottom.'
WHERE id = 'p0000000-0000-0000-0000-000000000003';

UPDATE products SET description = 'Retro-inspired round metal frame for a vintage aesthetic.'
WHERE id = 'p0000000-0000-0000-0000-000000000004';

UPDATE products SET description = 'Bold rectangular frame with a confident, masculine feel.'
WHERE id = 'p0000000-0000-0000-0000-000000000005';

UPDATE products SET description = 'Top cycling performance shield with vented lenses for maximum airflow.'
WHERE id = 'p0000000-0000-0000-0000-000000000006';

UPDATE products SET description = 'Urban-inspired oversized shield blending street style with performance.'
WHERE id = 'p0000000-0000-0000-0000-000000000007';

UPDATE products SET description = 'Everyday sunglasses with a distinctly American heritage.'
WHERE id = 'p0000000-0000-0000-0000-000000000008';

UPDATE products SET description = 'Extended coverage wrap lens for optimal field of view in sport.'
WHERE id = 'p0000000-0000-0000-0000-000000000009';

UPDATE products SET description = 'An 80s skate-culture icon reborn — lightweight and effortlessly cool.'
WHERE id = 'p0000000-0000-0000-0000-000000000010';

-- ─── Translate variant color names ───────────────────────────────────────────
UPDATE product_variants SET color_name = 'Gold/Green'        WHERE id = 'v0000000-0000-0000-0000-000000000001';
UPDATE product_variants SET color_name = 'Black'             WHERE id = 'v0000000-0000-0000-0000-000000000002';
UPDATE product_variants SET color_name = 'Tortoise'          WHERE id = 'v0000000-0000-0000-0000-000000000003';
UPDATE product_variants SET color_name = 'Black/Gold'        WHERE id = 'v0000000-0000-0000-0000-000000000004';
UPDATE product_variants SET color_name = 'Silver'            WHERE id = 'v0000000-0000-0000-0000-000000000005';
UPDATE product_variants SET color_name = 'Neon Green'        WHERE id = 'v0000000-0000-0000-0000-000000000006';
UPDATE product_variants SET color_name = 'Matte White'       WHERE id = 'v0000000-0000-0000-0000-000000000007';
UPDATE product_variants SET color_name = 'Matte Black'       WHERE id = 'v0000000-0000-0000-0000-000000000008';
UPDATE product_variants SET color_name = 'Steel Blue'        WHERE id = 'v0000000-0000-0000-0000-000000000009';
UPDATE product_variants SET color_name = 'Crystal Clear'     WHERE id = 'v0000000-0000-0000-0000-000000000010';

-- ─── New categories ──────────────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, slug, description, parent_id, created_at) VALUES
('c0000000-0000-0000-0000-000000000003', 'Prescription Glasses', 'prescription-glasses', 'Corrective optical frames for everyday vision.', NULL, NOW()),
('c0000000-0000-0000-0000-000000000004', 'Reading Glasses',      'reading-glasses',      'Ready-readers for comfortable near-vision.',      NULL, NOW()),
('c0000000-0000-0000-0000-000000000005', 'Blue Light Glasses',   'blue-light-glasses',   'Screen-filtering lenses to reduce digital eye strain.', NULL, NOW()),
('c0000000-0000-0000-0000-000000000006', 'Kids Glasses',         'kids-glasses',          'Durable, safe eyewear designed for children.',    NULL, NOW()),
('c0000000-0000-0000-0000-000000000007', 'Accessories',          'accessories',           'Cases, cleaning kits, straps, and more.',          NULL, NOW());
