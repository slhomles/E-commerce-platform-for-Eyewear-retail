-- =============================================
-- V13: Add promo/split-layout fields to banners
-- Supports PROMO display style (split image + text panel)
-- =============================================

ALTER TABLE banners
    ADD COLUMN display_style ENUM('IMAGE', 'PROMO') NOT NULL DEFAULT 'IMAGE'
        COMMENT 'IMAGE = full-width image slide; PROMO = split layout with text panel',
    ADD COLUMN tag           VARCHAR(100) NULL
        COMMENT 'Small uppercase label above title (e.g. INTERNATIONAL)',
    ADD COLUMN highlight     VARCHAR(100) NULL
        COMMENT 'Giant bold text (e.g. SALE)',
    ADD COLUMN bg_color      VARCHAR(20)  NULL DEFAULT '#E91E8C'
        COMMENT 'Right panel background color (hex)',
    ADD COLUMN text_color    VARCHAR(20)  NULL DEFAULT '#ffffff'
        COMMENT 'Right panel text color (hex)',
    ADD COLUMN cta_text      VARCHAR(50)  NULL DEFAULT 'SHOP NOW'
        COMMENT 'Call-to-action button label';
