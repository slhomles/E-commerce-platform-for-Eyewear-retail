package com.e_commerce.glasses_store.modules.admin.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Comprehensive revenue statistics response.
 * Designed for the admin analytics dashboard.
 */
public record RevenueStatsResponse(

        // ── KPI Summary ──────────────────────────────────────────────────────
        BigDecimal totalRevenue,
        BigDecimal revenueThisMonth,
        BigDecimal revenueLastMonth,
        BigDecimal revenueToday,
        double monthOverMonthGrowthPercent,
        BigDecimal averageOrderValue,

        // ── Order Counts ─────────────────────────────────────────────────────
        long totalOrders,
        long ordersThisMonth,
        long ordersToday,
        long paidOrders,
        long pendingOrders,
        long cancelledOrders,
        double orderConversionRate,        // paid / total %

        // ── Revenue Breakdowns ────────────────────────────────────────────────
        List<MonthlyRevenue> monthlyTrend, // last 12 months
        List<PaymentMethodRevenue> byPaymentMethod,
        List<OrderStatusCount> byOrderStatus,
        List<TopProduct> topProducts       // top 5 by revenue

) {

    // ── Nested Records ────────────────────────────────────────────────────────

    public record MonthlyRevenue(
            int year,
            int month,
            String monthLabel,   // "Jan 2025"
            BigDecimal revenue,
            long orderCount
    ) {}

    public record PaymentMethodRevenue(
            String method,       // COD | BANK_TRANSFER | VNPAY
            String methodLabel,  // Cash on Delivery | Bank Transfer | VNPay
            BigDecimal revenue,
            long orderCount,
            double percentage    // % of total revenue
    ) {}

    public record OrderStatusCount(
            String status,
            String statusLabel,
            long count,
            double percentage
    ) {}

    public record TopProduct(
            String productId,
            String productName,
            BigDecimal totalRevenue,
            long totalQuantity,
            double revenueShare  // % of total revenue
    ) {}
}
