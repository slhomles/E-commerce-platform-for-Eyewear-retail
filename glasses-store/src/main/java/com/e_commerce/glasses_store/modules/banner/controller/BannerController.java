package com.e_commerce.glasses_store.modules.banner.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.banner.dto.BannerResponse;
import com.e_commerce.glasses_store.modules.banner.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public API cho banner — không yêu cầu xác thực.
 */
@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /**
     * GET /api/v1/banners/active — Lấy banner đang hiển thị theo vị trí trang.
     * @param location HOME | FEATURED | RECOMMENDED (mặc định HOME)
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners(
            @RequestParam(required = false, defaultValue = "HOME") String location) {
        
        List<BannerResponse> banners = bannerService.getActiveBannersByLocation(location);
        return ResponseEntity.ok(ApiResponse.success(banners));
    }
}
