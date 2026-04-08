package com.e_commerce.glasses_store.modules.banner.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Banner quảng cáo tương tác.
 * Hỗ trợ liên kết đến sản phẩm, danh mục, hoặc URL tùy chỉnh.
 * Có hẹn giờ hiển thị và tự hết hạn.
 */
@Entity
@Table(name = "banners", indexes = {
        @Index(name = "idx_banners_active_date", columnList = "is_active, start_date, end_date"),
        @Index(name = "idx_banners_position", columnList = "position")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String subtitle;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 20)
    @Builder.Default
    private LinkType linkType = LinkType.CUSTOM_URL;

    @Column(name = "link_value", nullable = false, length = 500)
    private String linkValue;

    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    // ── Promo / split-layout fields ──────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "display_style", nullable = false, length = 10)
    @Builder.Default
    private DisplayStyle displayStyle = DisplayStyle.IMAGE;

    /** Small uppercase label above title (e.g. "INTERNATIONAL"). PROMO only. */
    @Column(length = 100)
    private String tag;

    /** Giant bold text (e.g. "SALE"). PROMO only. */
    @Column(length = 100)
    private String highlight;

    /** Right panel background color (hex). PROMO only. Default #E91E8C. */
    @Column(name = "bg_color", length = 20)
    @Builder.Default
    private String bgColor = "#E91E8C";

    /** Right panel text color (hex). PROMO only. Default #ffffff. */
    @Column(name = "text_color", length = 20)
    @Builder.Default
    private String textColor = "#ffffff";

    /** Call-to-action button label. PROMO only. Default "SHOP NOW". */
    @Column(name = "cta_text", length = 50)
    @Builder.Default
    private String ctaText = "SHOP NOW";

    // ==================== Enums ====================

    public enum LinkType {
        PRODUCT,    // Liên kết đến sản phẩm cụ thể
        CATEGORY,   // Liên kết đến danh mục
        CUSTOM_URL  // Liên kết đến URL tùy chỉnh (ví dụ: /shop?brand=RayBan)
    }

    public enum DisplayStyle {
        IMAGE,  // Full-width image slide (default)
        PROMO   // Split layout: image left, styled text panel right
    }

    // ==================== Business Methods ====================

    /**
     * Kiểm tra banner có đang trong thời gian hiển thị không.
     */
    public boolean isCurrentlyVisible() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && now.isAfter(startDate) && now.isBefore(endDate);
    }
}
