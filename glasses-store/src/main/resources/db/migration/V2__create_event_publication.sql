-- Flyway Migration: V2__create_event_publication.sql
-- Creates table for Spring Modulith Event Publication Registry
CREATE TABLE IF NOT EXISTS event_publication (
  id VARCHAR(36) NOT NULL,
  listener_id VARCHAR(512) NOT NULL,
  event_type VARCHAR(512) NOT NULL,
  serialized_event LONGTEXT NOT NULL,
  publication_date DATETIME(6) NOT NULL,
  completion_date DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
