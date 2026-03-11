package com.e_commerce.glasses_store.modules.admin.dto;

import java.math.BigDecimal;

/**
 * Dashboard stats response.
 */
public record DashboardStatsResponse(
        long totalProducts,
        long totalCategories,
        long totalBrands,
        long lowStockCount,
        BigDecimal totalRevenue) {
}
