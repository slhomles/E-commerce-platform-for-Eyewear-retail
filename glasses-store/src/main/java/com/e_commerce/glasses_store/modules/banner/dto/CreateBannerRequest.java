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
 * DTO tạo banner mới.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBannerRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String subtitle;

    @NotBlank(message = "URL ảnh không được để trống")
    private String imageUrl;

    @NotNull(message = "Loại liên kết không được để trống")
    private Banner.LinkType linkType;

    @NotBlank(message = "Giá trị liên kết không được để trống")
    private String linkValue;

    @Builder.Default
    private Integer position = 0;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    // Promo / split-layout fields (optional — only used when displayStyle = PROMO)
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
}
