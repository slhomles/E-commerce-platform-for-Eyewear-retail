package com.e_commerce.glasses_store.modules.banner.dto;

import com.e_commerce.glasses_store.modules.banner.entity.Banner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cập nhật banner — tất cả field đều optional.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBannerRequest {

    private String title;

    private String subtitle;

    private String imageUrl;

    private Banner.LinkType linkType;

    private String linkValue;

    private Integer position;

    private Boolean isActive;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    // Promo / split-layout fields (all optional)
    private Banner.DisplayStyle displayStyle;
    private String tag;
    private String highlight;
    private String bgColor;
    private String textColor;
    private String ctaText;
}
