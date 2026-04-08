package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.RevenueStatsResponse;
import com.e_commerce.glasses_store.modules.admin.dto.RevenueStatsResponse.*;
import com.e_commerce.glasses_store.modules.admin.service.StatsService;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderItemRepository;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatsServiceImpl implements StatsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    private static final Map<String, String> PAYMENT_METHOD_LABELS = Map.of(
            "COD", "Cash on Delivery",
            "BANK_TRANSFER", "Bank Transfer",
            "VNPAY", "VNPay"
    );

    private static final Map<String, String> ORDER_STATUS_LABELS = Map.of(
            "PENDING", "Pending",
            "PAID", "Paid",
            "PACKING", "Packing",
            "SHIPPING", "Shipping",
            "DELIVERED", "Delivered",
            "CANCELLED", "Cancelled"
    );

    @Override
    public RevenueStatsResponse getRevenueStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfThisMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfThisMonth;

        // ── KPI ──────────────────────────────────────────────────────────────
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        BigDecimal revenueThisMonth = orderRepository.sumRevenueBetween(startOfThisMonth, now.plusSeconds(1));
        BigDecimal revenueLastMonth = orderRepository.sumRevenueBetween(startOfLastMonth, endOfLastMonth);
        BigDecimal revenueToday = orderRepository.sumRevenueBetween(startOfToday, now.plusSeconds(1));
        BigDecimal avgOrderValue = orderRepository.avgOrderValue();

        double momGrowth = calculateGrowthPercent(revenueLastMonth, revenueThisMonth);

        // ── Order Counts ─────────────────────────────────────────────────────
        long totalOrders = orderRepository.count();
        long ordersThisMonth = orderRepository.countOrdersBetween(startOfThisMonth, now.plusSeconds(1));
        long ordersToday = orderRepository.countOrdersBetween(startOfToday, now.plusSeconds(1));
        long paidOrders = orderRepository.countByPaymentStatus(Order.PaymentStatus.PAID);
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);
        double conversionRate = totalOrders == 0 ? 0.0 :
                Math.round((paidOrders * 100.0 / totalOrders) * 10.0) / 10.0;

        // ── Monthly Trend (last 12 months) ───────────────────────────────────
        LocalDateTime twelveMonthsAgo = startOfThisMonth.minusMonths(11);
        List<Object[]> rawMonthly = orderRepository.findMonthlyRevenueSince(twelveMonthsAgo);
        List<MonthlyRevenue> monthlyTrend = buildMonthlyTrend(rawMonthly, twelveMonthsAgo, now);

        // ── Payment Method Breakdown ─────────────────────────────────────────
        List<Object[]> rawPayment = orderRepository.findRevenueByPaymentMethod();
        List<PaymentMethodRevenue> byPaymentMethod = buildPaymentMethodRevenue(rawPayment, totalRevenue);

        // ── Order Status Breakdown ───────────────────────────────────────────
        List<Object[]> rawStatus = orderRepository.countByOrderStatus();
        List<OrderStatusCount> byOrderStatus = buildOrderStatusCounts(rawStatus, totalOrders);

        // ── Top 5 Products ───────────────────────────────────────────────────
        List<Object[]> rawTop = orderItemRepository.findTopProductsByRevenue(PageRequest.of(0, 5));
        List<TopProduct> topProducts = buildTopProducts(rawTop, totalRevenue);

        log.info("Revenue stats computed: totalRevenue={}, ordersThisMonth={}", totalRevenue, ordersThisMonth);

        return new RevenueStatsResponse(
                totalRevenue, revenueThisMonth, revenueLastMonth, revenueToday,
                momGrowth, avgOrderValue,
                totalOrders, ordersThisMonth, ordersToday,
                paidOrders, pendingOrders, cancelledOrders, conversionRate,
                monthlyTrend, byPaymentMethod, byOrderStatus, topProducts
        );
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private double calculateGrowthPercent(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    /**
     * Fills all 12 months in the range, even months with zero revenue.
     */
    private List<MonthlyRevenue> buildMonthlyTrend(List<Object[]> raw, LocalDateTime since, LocalDateTime now) {
        Map<String, Object[]> dataMap = new LinkedHashMap<>();
        for (Object[] row : raw) {
            String key = row[0] + "-" + row[1]; // "2025-3"
            dataMap.put(key, row);
        }

        List<MonthlyRevenue> result = new ArrayList<>();
        YearMonth cursor = YearMonth.from(since.toLocalDate());
        YearMonth current = YearMonth.from(now.toLocalDate());

        while (!cursor.isAfter(current)) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            Object[] row = dataMap.get(key);
            BigDecimal revenue = row != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            long count = row != null ? ((Number) row[3]).longValue() : 0L;
            String label = cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + cursor.getYear();

            result.add(new MonthlyRevenue(cursor.getYear(), cursor.getMonthValue(), label, revenue, count));
            cursor = cursor.plusMonths(1);
        }
        return result;
    }

    private List<PaymentMethodRevenue> buildPaymentMethodRevenue(List<Object[]> raw, BigDecimal totalRevenue) {
        List<PaymentMethodRevenue> result = new ArrayList<>();
        BigDecimal total = totalRevenue == null || totalRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ONE : totalRevenue;

        for (Object[] row : raw) {
            String method = row[0] != null ? row[0].toString() : "UNKNOWN";
            BigDecimal revenue = (BigDecimal) row[1];
            long count = ((Number) row[2]).longValue();
            double pct = revenue.divide(total, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();

            result.add(new PaymentMethodRevenue(
                    method,
                    PAYMENT_METHOD_LABELS.getOrDefault(method, method),
                    revenue, count, pct
            ));
        }
        return result;
    }

    private List<OrderStatusCount> buildOrderStatusCounts(List<Object[]> raw, long totalOrders) {
        List<OrderStatusCount> result = new ArrayList<>();
        long total = totalOrders == 0 ? 1 : totalOrders;

        for (Object[] row : raw) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            double pct = Math.round((count * 100.0 / total) * 10.0) / 10.0;

            result.add(new OrderStatusCount(
                    status,
                    ORDER_STATUS_LABELS.getOrDefault(status, status),
                    count, pct
            ));
        }
        return result;
    }

    private List<TopProduct> buildTopProducts(List<Object[]> raw, BigDecimal totalRevenue) {
        BigDecimal total = totalRevenue == null || totalRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ONE : totalRevenue;

        List<TopProduct> result = new ArrayList<>();
        for (Object[] row : raw) {
            String productId = (String) row[0];
            String productName = (String) row[1];
            BigDecimal revenue = (BigDecimal) row[2];
            long qty = ((Number) row[3]).longValue();
            double share = revenue.divide(total, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();

            result.add(new TopProduct(productId, productName, revenue, qty, share));
        }
        return result;
    }
}
