-- Spring Modulith 2.0 schema adds completion_attempts, last_resubmission_date,
-- and status to event_publication. Use PREPARE/EXECUTE for conditional adds
-- because MySQL 8 does not support ALTER TABLE ... ADD COLUMN IF NOT EXISTS.

SET @s1 = (SELECT IF(EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='event_publication' AND COLUMN_NAME='completion_attempts'
), 'SELECT 1', 'ALTER TABLE event_publication ADD COLUMN completion_attempts INT NOT NULL DEFAULT 0'));
PREPARE st1 FROM @s1; EXECUTE st1; DEALLOCATE PREPARE st1;

SET @s2 = (SELECT IF(EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='event_publication' AND COLUMN_NAME='last_resubmission_date'
), 'SELECT 1', 'ALTER TABLE event_publication ADD COLUMN last_resubmission_date DATETIME(6) NULL'));
PREPARE st2 FROM @s2; EXECUTE st2; DEALLOCATE PREPARE st2;

SET @s3 = (SELECT IF(EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='event_publication' AND COLUMN_NAME='status'
), 'SELECT 1', 'ALTER TABLE event_publication ADD COLUMN status VARCHAR(255) NULL'));
PREPARE st3 FROM @s3; EXECUTE st3; DEALLOCATE PREPARE st3;
