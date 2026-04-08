package com.e_commerce.glasses_store.modules.order.repository;

import com.e_commerce.glasses_store.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    java.util.Optional<Order> findByCode(String code);

    // ==================== Revenue Aggregations ====================

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED' " +
           "AND o.createdAt >= :from AND o.createdAt < :to")
    BigDecimal sumRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(AVG(o.finalAmount), 0) FROM Order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED'")
    BigDecimal avgOrderValue();

    // ==================== Order Count ====================

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to")
    long countOrdersBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    long countByStatus(Order.OrderStatus status);

    long countByPaymentStatus(Order.PaymentStatus paymentStatus);

    // ==================== Monthly Trend (last N months) ====================

    /**
     * Returns [year, month, revenue, orderCount] grouped by month.
     */
    @Query("SELECT FUNCTION('YEAR', o.createdAt), FUNCTION('MONTH', o.createdAt), " +
           "COALESCE(SUM(o.finalAmount), 0), COUNT(o) " +
           "FROM Order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED' " +
           "AND o.createdAt >= :since " +
           "GROUP BY FUNCTION('YEAR', o.createdAt), FUNCTION('MONTH', o.createdAt) " +
           "ORDER BY FUNCTION('YEAR', o.createdAt), FUNCTION('MONTH', o.createdAt)")
    List<Object[]> findMonthlyRevenueSince(@Param("since") LocalDateTime since);

    // ==================== Breakdown by Payment Method ====================

    /**
     * Returns [paymentMethod, revenue, count] per method.
     */
    @Query("SELECT o.paymentMethod, COALESCE(SUM(o.finalAmount), 0), COUNT(o) " +
           "FROM Order o " +
           "WHERE o.paymentStatus = 'PAID' AND o.status <> 'CANCELLED' " +
           "GROUP BY o.paymentMethod")
    List<Object[]> findRevenueByPaymentMethod();

    // ==================== Breakdown by Order Status ====================

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByOrderStatus();
}
