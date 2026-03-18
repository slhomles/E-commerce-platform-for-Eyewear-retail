package com.e_commerce.glasses_store.modules.review.repository;

import com.e_commerce.glasses_store.modules.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String>, JpaSpecificationExecutor<Review> {

    Page<Review> findByProductIdAndIsDeletedFalseOrderByCreatedAtDesc(String productId, Pageable pageable);

    Optional<Review> findByUserIdAndOrderIdAndProductIdAndIsDeletedFalse(String userId, String orderId,
            String productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isDeleted = false")
    Double getAverageRatingByProductId(String productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.isDeleted = false")
    Integer countReviewsByProductId(String productId);
}
