package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    List<OrderItem> findByOrderId(String orderId);

    /**
     * Top products by revenue from paid orders.
     * Returns [productId, productName, totalRevenue, totalQuantity].
     */
    @Query("SELECT oi.productId, oi.productName, SUM(oi.subtotal), SUM(oi.quantity) " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED' " +
           "GROUP BY oi.productId, oi.productName " +
           "ORDER BY SUM(oi.subtotal) DESC")
    List<Object[]> findTopProductsByRevenue(@Param("limit") org.springframework.data.domain.Pageable pageable);
}
