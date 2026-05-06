package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.entity.Order.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Order entity.
 * Extends JpaSpecificationExecutor để hỗ trợ dynamic filtering.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    java.util.Optional<Order> findByCode(String code);

    List<Order> findTop5ByUserIdOrderByCreatedAtDesc(String userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, OrderStatus status, Pageable pageable);

    long countByUserIdAndStatus(String userId, OrderStatus status);

    long countByUserId(String userId);
}
