package com.e_commerce.glasses_store.modules.chatbot.dto.response;

import java.math.BigDecimal;

public record ProductCardDto(
        String id,
        String name,
        String slug,
        String imageUrl,
        BigDecimal basePrice,
        BigDecimal salePrice,
        String brandName,
        String frameShape,
        String gender
) {}
