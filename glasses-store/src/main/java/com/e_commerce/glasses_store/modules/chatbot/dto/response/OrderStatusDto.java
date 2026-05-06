package com.e_commerce.glasses_store.modules.chatbot.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderStatusDto(
        String orderId,
        String code,
        String status,
        String paymentMethod,
        BigDecimal finalAmount,
        LocalDateTime createdAt
) {}
