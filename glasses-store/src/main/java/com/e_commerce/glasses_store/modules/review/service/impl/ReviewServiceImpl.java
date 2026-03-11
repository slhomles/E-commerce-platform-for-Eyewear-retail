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
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or you don't have permission"));

        // Kiểm tra xem đơn hàng có thuộc về user hay không
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to you");
        }

        // Kiểm tra xem đơn hàng đã DELIVERED chưa
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("You can only review products from delivered orders");
        }

        // Kiểm tra xem sản phẩm có trong đơn hàng này không
        boolean hasProductInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(product.getId()));
        if (!hasProductInOrder) {
            throw new IllegalArgumentException("You did not purchase this product in the specified order");
        }

        // Kiểm tra xem user đã review sản phẩm này trong đơn hàng này chưa
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
                .productId(r.getProduct().getId())
                .userId(r.getUser().getId())
                .userFullName(r.getUser().getFullName())
                .userAvatar(r.getUser().getAvatar())
                .orderId(r.getOrder().getId())
                .rating(r.getRating())
                .content(r.getContent())
                .images(imagesList)
                .isVerifiedPurchase(r.getIsVerifiedPurchase())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.now())
                .build();
    }

    @Override
    public void seedMockReviews() {
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findAll();

        if (users.isEmpty() || products.isEmpty()) {
            log.warn("Cannot seed reviews: users or products list is empty.");
            return;
        }

        Random random = new Random();
        String[] comments = {
                "Sản phẩm rất tốt, đáng tiền!",
                "Kính đeo nhẹ, form chuẩn, rất hợp với mặt mình.",
                "Chất lượng ổn trong tầm giá. Giao hàng nhanh.",
                "Đóng gói cẩn thận, hàng đẹp bá cháy bọ chét 10 điểm.",
                "Hàng đẹp nhưng giao hơi lâu một chút.",
                "Rất ưng ý, sẽ ủng hộ shop lần sau.",
                "Kính thời trang, chống nắng tốt, viền chắc chắn.",
                "Gọng kính cứng cáp, tròng kính trong suốt, đáng mua.",
                "Shop tư vấn nhiệt tình, sản phẩm như hình.",
                "Tốt quá trời quá đất luôn mọi người ơi."
        };

        for (Product product : products) {
            // Chỉ tạo review nếu product có variant để mapping vào OrderItem
            if (product.getVariants() == null || product.getVariants().isEmpty()) {
                log.warn("Skipping product {} - no variants found", product.getId());
                continue;
            }
            ProductVariant firstVariant = product.getVariants().get(0);

            int numReviews = random.nextInt(10) + 1; // 1 to 10 reviews per product
            for (int i = 0; i < numReviews; i++) {
                User user = users.get(random.nextInt(users.size()));

                // Tự động tạo một đơn hàng ảo (MOCK) có trạng thái DELIVERED
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

                // Tạo review dựa trên Order MOCK
                int rating = random.nextInt(2) + 4; // Ngẫu nhiên 4 hoặc 5 sao để seed cho đẹp, thay vì 1-5
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
    }
}
