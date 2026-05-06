package com.e_commerce.glasses_store.modules.chatbot.repository;

import com.e_commerce.glasses_store.modules.chatbot.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    Optional<ChatSession> findBySessionKey(String sessionKey);
    Optional<ChatSession> findByIdAndUserId(String id, String userId);
}
