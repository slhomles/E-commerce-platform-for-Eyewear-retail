package com.e_commerce.glasses_store.modules.banner.dto;

import com.e_commerce.glasses_store.modules.banner.entity.Banner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho banner — dùng cho cả public API lẫn admin API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponse {

    private String id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private Banner.LinkType linkType;
    private String linkValue;
    private Integer position;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Promo / split-layout fields
    private Banner.DisplayStyle displayStyle;
    private String tag;
    private String highlight;
    private String bgColor;
    private String textColor;
    private String ctaText;

    /**
     * Trạng thái hiển thị thực tế (computed field).
     * - ACTIVE: đang hiển thị
     * - SCHEDULED: chưa đến giờ bắt đầu
     * - EXPIRED: đã hết hạn
     * - DISABLED: admin tắt thủ công
     */
    private String displayStatus;

    /**
     * Tạo response từ entity + tính displayStatus.
     */
    public static BannerResponse fromEntity(Banner banner) {
        LocalDateTime now = LocalDateTime.now();
        String status;

        if (!banner.getIsActive()) {
            status = "DISABLED";
        } else if (now.isBefore(banner.getStartDate())) {
            status = "SCHEDULED";
        } else if (now.isAfter(banner.getEndDate())) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .linkType(banner.getLinkType())
                .linkValue(banner.getLinkValue())
                .position(banner.getPosition())
                .isActive(banner.getIsActive())
                .startDate(banner.getStartDate())
                .endDate(banner.getEndDate())
                .createdAt(banner.getCreatedAt())
                .updatedAt(banner.getUpdatedAt())
                .displayStatus(status)
                .displayStyle(banner.getDisplayStyle())
                .tag(banner.getTag())
                .highlight(banner.getHighlight())
                .bgColor(banner.getBgColor())
                .textColor(banner.getTextColor())
                .ctaText(banner.getCtaText())
                .build();
    }
}
