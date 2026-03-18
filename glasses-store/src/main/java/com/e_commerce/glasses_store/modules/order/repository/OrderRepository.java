package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Repository cho Order entity.
 * Extends JpaSpecificationExecutor để hỗ trợ dynamic filtering.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    java.util.Optional<Order> findByCode(String code);
}
