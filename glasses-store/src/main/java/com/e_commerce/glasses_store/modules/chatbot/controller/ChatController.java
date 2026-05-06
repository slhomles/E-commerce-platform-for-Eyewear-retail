package com.e_commerce.glasses_store.modules.chatbot.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.chatbot.dto.request.ChatRequest;
import com.e_commerce.glasses_store.modules.chatbot.dto.response.ChatResponse;
import com.e_commerce.glasses_store.modules.chatbot.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/v1/chat
     * Auth is optional — guests can search products and get FAQ answers.
     * Authenticated users additionally get order lookup capability.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @RequestBody @Valid ChatRequest request,
            @AuthenticationPrincipal User user) {

        String userId = (user != null) ? user.getId() : null;
        ChatResponse response = chatService.chat(request.message(), request.sessionId(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
