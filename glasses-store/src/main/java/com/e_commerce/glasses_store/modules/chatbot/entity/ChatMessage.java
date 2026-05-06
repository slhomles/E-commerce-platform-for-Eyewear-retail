package com.e_commerce.glasses_store.modules.chatbot.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "tool_name", length = 100)
    private String toolName;

    public enum MessageRole {
        USER, ASSISTANT
    }
}
