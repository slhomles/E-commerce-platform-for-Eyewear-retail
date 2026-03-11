package com.e_commerce.glasses_store.modules.review.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.review.dto.request.PlaceReviewRequest;
import com.e_commerce.glasses_store.modules.review.dto.response.ReviewResponse;
import com.e_commerce.glasses_store.modules.review.service.ReviewService;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> result = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @AuthenticationPrincipal User userDetails,
            @Valid @RequestBody PlaceReviewRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized"));
        }

        ReviewResponse result = reviewService.addReview(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/seed-mock-data")
    public ResponseEntity<ApiResponse<String>> seedMockData() {
        reviewService.seedMockReviews();
        return ResponseEntity.ok(ApiResponse.success("Mock reviews seeded successfully"));
    }
}
