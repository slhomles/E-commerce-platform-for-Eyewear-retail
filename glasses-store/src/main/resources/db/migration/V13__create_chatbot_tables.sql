-- V13: Chatbot feature — session and message persistence
-- Redis holds live conversation; these tables are for archive and analytics.

CREATE TABLE IF NOT EXISTS chat_sessions (
    id          VARCHAR(36)  NOT NULL,
    user_id     VARCHAR(36)  NULL COMMENT 'NULL = anonymous guest',
    session_key VARCHAR(128) NOT NULL COMMENT 'Redis key suffix',
    started_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_chat_sessions_key (session_key),
    INDEX idx_chat_sessions_user (user_id),
    INDEX idx_chat_sessions_active (is_active, last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id          VARCHAR(36)              NOT NULL,
    session_id  VARCHAR(36)              NOT NULL,
    role        ENUM('USER','ASSISTANT') NOT NULL,
    content     LONGTEXT                 NOT NULL,
    tool_name   VARCHAR(100)             NULL COMMENT 'function call name if AI used a tool',
    created_at  DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_chat_messages_session (session_id),
    CONSTRAINT fk_chat_msg_session FOREIGN KEY (session_id)
        REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
