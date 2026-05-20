package com.e_commerce.glasses_store.modules.review.service.impl;

import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.entity.OrderItem;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.product.entity.Product;
import com.e_commerce.glasses_store.modules.product.entity.ProductVariant;
import com.e_commerce.glasses_store.modules.product.repository.ProductRepository;
import com.e_commerce.glasses_store.modules.review.dto.request.PlaceReviewRequest;
import com.e_commerce.glasses_store.modules.review.dto.response.ReviewResponse;
import com.e_commerce.glasses_store.modules.review.entity.Review;
import com.e_commerce.glasses_store.modules.review.repository.ReviewRepository;
import com.e_commerce.glasses_store.modules.review.service.ReviewService;
import com.e_commerce.glasses_store.modules.review.validation.ReviewContentPolicy;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Random;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(String productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductIdAndIsDeletedFalseOrderByCreatedAtDesc(productId,
                pageable);
        return reviews.map(this::toResponse);
    }

    @Override
    public ReviewResponse addReview(String userId, PlaceReviewRequest request) {
        ReviewContentPolicy.validate(request.getContent());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or you don't have permission"));

        // Check whether the order belongs to the user.
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to you");
        }

        // Check whether the order has been delivered.
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("You can only review products from delivered orders");
        }

        // Check whether the product exists in this order.
        boolean hasProductInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(product.getId()));
        if (!hasProductInOrder) {
            throw new IllegalArgumentException("You did not purchase this product in the specified order");
        }

        // Check whether the user already reviewed this product in this order.
        Optional<Review> existingReviewOpt = reviewRepository.findByUserIdAndOrderIdAndProductIdAndIsDeletedFalse(
                userId, request.getOrderId(), request.getProductId());

        Review review;
        if (existingReviewOpt.isPresent()) {
            review = existingReviewOpt.get(); // Update existing
            review.setRating(request.getRating());
            review.setContent(request.getContent());
        } else {
            review = Review.builder()
                    .user(user)
                    .product(product)
                    .order(order)
                    .rating(request.getRating())
                    .content(request.getContent())
                    .isVerifiedPurchase(true)
                    .isDeleted(false)
                    .build();
        }

        // Handle images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                review.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (Exception e) {
                log.warn("Failed to serialize review images", e);
            }
        }

        Review savedReview = reviewRepository.save(review);
        log.info("User {} added/updated review {} for product {}", userId, savedReview.getId(), product.getId());

        return toResponse(savedReview);
    }

    private ReviewResponse toResponse(Review r) {
        java.util.List<String> imagesList = null;
        if (r.getImages() != null && !r.getImages().isEmpty()) {
            try {
                imagesList = objectMapper.readValue(r.getImages(),
                        new com.fasterxml.jackson.core.type.TypeReference<>() {
                        });
            } catch (Exception e) {
                imagesList = java.util.Collections.emptyList();
            }
        }

        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : "Unknown Product")
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userFullName(r.getUser() != null ? r.getUser().getFullName() : "Unknown User")
                .userAvatar(r.getUser() != null ? r.getUser().getAvatar() : null)
                .orderId(r.getOrder() != null ? r.getOrder().getId() : null)
                .rating(r.getRating())
                .content(ReviewContentPolicy.sanitizeForDisplay(r.getContent()))
                .images(imagesList != null ? imagesList : java.util.Collections.emptyList())
                .isVerifiedPurchase(r.getIsVerifiedPurchase() != null ? r.getIsVerifiedPurchase() : true)
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.now())
                .build();
    }

    @Override
    public void seedMockReviews() {
        try {
            // Limit to 10 products and 10 users to avoid memory pressure/timeouts on EC2.
            List<Product> products = productRepository.findAll(PageRequest.of(0, 10)).getContent();
            List<User> users = userRepository.findAll(PageRequest.of(0, 10)).getContent();

            if (users.isEmpty() || products.isEmpty()) {
                log.warn("Cannot seed reviews: users or products list is empty.");
                return;
            }

            Random random = new Random();
            String[] comments = {
                    "Great product and worth the price.",
                    "Lightweight glasses with a comfortable fit.",
                    "Good quality for the price. Fast delivery.",
                    "Carefully packed and the product looks great.",
                    "Nice product, although delivery was a little slow.",
                    "Very satisfied. I will support the shop again.",
                    "Stylish glasses with good sun protection and a sturdy frame.",
                    "Strong frame, clear lenses, and worth buying.",
                    "Helpful support and the product matches the photos.",
                    "Excellent overall experience."
            };

            for (Product product : products) {
                // Only create reviews for products that have variants for OrderItem mapping.
                if (product.getVariants() == null || product.getVariants().isEmpty()) {
                    log.warn("Skipping product {} - no variants found", product.getId());
                    continue;
                }
                ProductVariant firstVariant = product.getVariants().get(0);

                int numReviews = random.nextInt(3) + 1; // 1 to 3 reviews per product to limit memory use
                for (int i = 0; i < numReviews; i++) {
                    User user = users.get(random.nextInt(users.size()));

                    // Create a mock DELIVERED order.
                    Order order = Order.builder()
                            .userId(user.getId())
                            .code("M-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .totalAmount(BigDecimal.ZERO)
                            .finalAmount(BigDecimal.ZERO)
                            .status(Order.OrderStatus.DELIVERED)
                            .paymentStatus(Order.PaymentStatus.PAID)
                            .shippingAddressJson("{}")
                            .build();

                    OrderItem item = OrderItem.builder()
                            .order(order)
                            .productId(product.getId())
                            .productVariantId(firstVariant.getId())
                            .productName(product.getName())
                            .sku(firstVariant.getSku() != null ? firstVariant.getSku() : "MOCK-SKU")
                            .quantity(1)
                            .unitPrice(BigDecimal.ZERO)
                            .subtotal(BigDecimal.ZERO)
                            .build();

                    order.getItems().add(item);
                    order = orderRepository.save(order);

                    // Create a review from the mock order.
                    int rating = random.nextInt(2) + 4; // Random 4 or 5 stars for nicer seed data.
                    String comment = comments[random.nextInt(comments.length)];

                    Review review = Review.builder()
                            .user(user)
                            .product(product)
                            .order(order)
                            .rating(rating)
                            .content(comment)
                            .isVerifiedPurchase(true)
                            .isDeleted(false)
                            .build();

                    reviewRepository.save(review);
                }
                log.info("Seeded {} reviews for product {}", numReviews, product.getId());
            }
            log.info("Finished seeding mock reviews for all products.");
        } catch (Exception e) {
            log.error("Error during seeding mock reviews: ", e);
            throw new IllegalArgumentException("Seeding failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(String keyword, Pageable pageable) {
        return reviewRepository.findAll((root, query, cb) -> {
            // Eagerly fetch relations to avoid N+1 and LazyInitializationException
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("user", JoinType.LEFT);
                root.fetch("product", JoinType.LEFT);
                root.fetch("order", JoinType.LEFT);
            }

            Predicate predicate = cb.isFalse(root.get("isDeleted"));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                
                // Use joins for filtering
                Join<Review, User> userJoin = root.join("user", JoinType.LEFT);
                Join<Review, Product> productJoin = root.join("product", JoinType.LEFT);

                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("content")), pattern),
                        cb.like(cb.lower(userJoin.get("fullName")), pattern),
                        cb.like(cb.lower(productJoin.get("name")), pattern)
                );
                predicate = cb.and(predicate, searchPredicate);
            }
            return predicate;
        }, pageable).map(this::toResponse);
    }

    @Override
    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setIsDeleted(true);
        reviewRepository.save(review);
        log.info("Admin deleted review: {}", id);
    }
}
