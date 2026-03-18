-- Flyway Migration: V10__add_oauth2_provider_fields.sql
-- Adds OAuth2 provider fields to users table for Social Login support

ALTER TABLE users
    ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL' AFTER role,
    ADD COLUMN provider_id VARCHAR(255) NULL AFTER provider;

-- Allow password to be null for OAuth2 users
ALTER TABLE users
    MODIFY COLUMN password VARCHAR(255) NULL;
