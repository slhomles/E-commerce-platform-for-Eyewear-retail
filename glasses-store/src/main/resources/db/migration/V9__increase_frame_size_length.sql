-- Increase frame_size length from 5 to 20 to support values like "Medium"
ALTER TABLE products MODIFY COLUMN frame_size VARCHAR(20);
