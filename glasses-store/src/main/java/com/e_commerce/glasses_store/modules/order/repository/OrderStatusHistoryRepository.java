package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, String> {
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(String orderId);
}
