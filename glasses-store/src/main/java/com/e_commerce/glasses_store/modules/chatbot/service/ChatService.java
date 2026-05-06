package com.e_commerce.glasses_store.modules.chatbot.service;

import com.e_commerce.glasses_store.modules.chatbot.dto.response.ChatResponse;

public interface ChatService {
    ChatResponse chat(String message, String sessionId, String userId);
}
