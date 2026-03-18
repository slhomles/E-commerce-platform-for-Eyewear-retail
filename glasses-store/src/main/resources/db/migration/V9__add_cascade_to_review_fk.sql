-- Flyway Migration: V9__add_cascade_to_review_fk.sql
-- Drop the existing foreign key constraint and re-add it with ON DELETE CASCADE
-- This ensures that when an order is deleted, all associated reviews are also deleted,
-- preventing foreign key constraint violations.

ALTER TABLE reviews DROP FOREIGN KEY fk_rev_order;

ALTER TABLE reviews
ADD CONSTRAINT fk_rev_order
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE;
