package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.RevenueStatsResponse;

import java.time.LocalDateTime;

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
     * Full revenue analytics — default (all-time).
     */
    RevenueStatsResponse getRevenueStats();

    /**
     * Full revenue analytics filtered by a custom date range.
     * Null values default to epoch / now.
     */
    RevenueStatsResponse getRevenueStats(LocalDateTime from, LocalDateTime to);
}
