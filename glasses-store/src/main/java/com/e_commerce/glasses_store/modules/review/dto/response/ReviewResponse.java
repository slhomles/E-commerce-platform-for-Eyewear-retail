package com.e_commerce.glasses_store.modules.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String productId;
    private String userId;
    private String userFullName;
    private String userAvatar;
    private String orderId;

    private Integer rating;
    private String content;
    private List<String> images;

    private Boolean isVerifiedPurchase;
    private LocalDateTime createdAt;
}
