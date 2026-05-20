package com.e_commerce.glasses_store.modules.banner.dto;

import com.e_commerce.glasses_store.modules.banner.entity.Banner;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for creating a new banner.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBannerRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String subtitle;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Link type is required")
    private Banner.LinkType linkType;

    /**
     * linkValue can be empty when linkType = NONE.
     */
    private String linkValue;

    @Builder.Default
    private Integer position = 0;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    // Promo / split-layout fields (optional - only used when displayStyle = PROMO)
    @Builder.Default
    private Banner.DisplayStyle displayStyle = Banner.DisplayStyle.IMAGE;

    private String tag;
    private String highlight;

    @Builder.Default
    private String bgColor = "#E91E8C";

    @Builder.Default
    private String textColor = "#ffffff";

    @Builder.Default
    private String ctaText = "SHOP NOW";

    // Font & Layout fields
    @Builder.Default
    private String horizontalAlignment = "LEFT";

    @Builder.Default
    private String verticalAlignment = "BOTTOM";

    @Builder.Default
    private Integer titleFontSize = 36;

    @Builder.Default
    private Integer subtitleFontSize = 18;

    @Builder.Default
    private String fontFamily = "'Tajawal', Helvetica, Arial, sans-serif";

    @Builder.Default
    private Banner.DisplayLocation displayLocation = Banner.DisplayLocation.HOME;
}
