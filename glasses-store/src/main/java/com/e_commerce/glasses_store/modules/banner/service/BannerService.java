package com.e_commerce.glasses_store.modules.banner.service;

import com.e_commerce.glasses_store.modules.banner.dto.BannerResponse;
import com.e_commerce.glasses_store.modules.banner.dto.CreateBannerRequest;
import com.e_commerce.glasses_store.modules.banner.dto.UpdateBannerRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BannerService {

    /**
     * Lấy danh sách banner đang active + trong thời gian hiển thị (public API).
     */
    List<BannerResponse> getActiveBanners();

    /**
     * Lấy danh sách banner public theo vị trí (HOME, FEATURED, RECOMMENDED).
     */
    List<BannerResponse> getActiveBannersByLocation(String location);

    /**
     * Admin: lấy tất cả banner kèm phân trang.
     */
    Page<BannerResponse> getAllBanners(Pageable pageable);

    /**
     * Admin: lấy chi tiết banner theo ID.
     */
    BannerResponse getBannerById(String id);

    /**
     * Admin: tạo banner mới.
     */
    BannerResponse createBanner(CreateBannerRequest request);

    /**
     * Admin: cập nhật banner.
     */
    BannerResponse updateBanner(String id, UpdateBannerRequest request);

    /**
     * Admin: xóa banner.
     */
    void deleteBanner(String id);

    /**
     * Admin: bật/tắt trạng thái banner.
     */
    BannerResponse toggleBannerStatus(String id);
}
