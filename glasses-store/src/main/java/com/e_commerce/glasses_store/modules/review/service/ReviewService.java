package com.e_commerce.glasses_store.modules.review.service;

import com.e_commerce.glasses_store.modules.review.dto.request.PlaceReviewRequest;
import com.e_commerce.glasses_store.modules.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    /**
     * Lấy danh sách review của một sản phẩm, public access.
     */
    Page<ReviewResponse> getProductReviews(String productId, Pageable pageable);

    /**
     * Thêm mới đánh giá (chỉ user đã mua, trạng thái order = DELIVERED mới được
     * phép).
     */
    ReviewResponse addReview(String userId, PlaceReviewRequest request);

    /**
     * Randomly generate 1-10 mock reviews for all products
     */
    void seedMockReviews();
}
