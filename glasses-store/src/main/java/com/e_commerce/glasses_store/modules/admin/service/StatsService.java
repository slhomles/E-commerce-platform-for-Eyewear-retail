package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.RevenueStatsResponse;

/**
 * Statistics service — extensible for future stat categories.
 *
 * Convention: add a new method per stat domain, e.g.:
 *   ProductStatsResponse getProductStats();
 *   OrderStatsResponse   getOrderStats();
 *   ReviewStatsResponse  getReviewStats();
 */
public interface StatsService {

    /**
     * Full revenue analytics for admin dashboard.
     */
    RevenueStatsResponse getRevenueStats();
}
