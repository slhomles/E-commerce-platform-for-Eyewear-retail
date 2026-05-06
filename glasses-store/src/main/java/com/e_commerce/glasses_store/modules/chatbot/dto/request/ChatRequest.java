package com.e_commerce.glasses_store.modules.chatbot.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message must not be blank")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        String message,

        String sessionId
) {}
