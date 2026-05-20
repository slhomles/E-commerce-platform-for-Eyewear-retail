-- Translate user-facing seed descriptions that can appear in the admin UI.
UPDATE site_settings
SET description = 'Number of Featured products shown on the Home page'
WHERE setting_key = 'home_featured_count';

UPDATE site_settings
SET description = 'Number of Recommended products shown on the Home page'
WHERE setting_key = 'home_recommended_count';

UPDATE site_settings
SET description = 'Number of products shown on the Featured page'
WHERE setting_key = 'featured_page_count';

UPDATE site_settings
SET description = 'Number of products shown on the Recommended page'
WHERE setting_key = 'recommended_page_count';

UPDATE site_settings
SET description = 'Number of products per Shop page'
WHERE setting_key = 'shop_page_size';

UPDATE site_settings
SET description = 'Show original price with strikethrough on product cards'
WHERE setting_key = 'show_original_price';

UPDATE site_settings
SET description = 'Show sale price on product cards'
WHERE setting_key = 'show_sale_price';

UPDATE site_settings
SET description = 'Show discount percentage badge on product cards'
WHERE setting_key = 'show_discount_badge';

-- Clean up a translated sample product description that previously contained mojibake.
UPDATE products
SET description = 'An 80s skate-culture icon reborn, lightweight and effortlessly cool.'
WHERE id = 'p0000000-0000-0000-0000-000000000010';
