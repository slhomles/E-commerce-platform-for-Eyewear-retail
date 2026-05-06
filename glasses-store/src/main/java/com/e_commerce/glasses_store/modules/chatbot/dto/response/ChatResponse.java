package com.e_commerce.glasses_store.modules.chatbot.dto.response;

import java.util.List;

public record ChatResponse(
        String sessionId,
        String reply,
        List<ProductCardDto> productCards,
        OrderStatusDto orderStatus,
        List<OrderStatusDto> orderList
) {}
