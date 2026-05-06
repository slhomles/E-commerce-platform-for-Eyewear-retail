package com.e_commerce.glasses_store.modules.chatbot.dto;

/**
 * A single turn in the conversation history stored in Redis.
 * role: "user" | "model"  (Gemini format)
 */
public record GeminiConversationMessage(
        String role,
        String text
) {}
