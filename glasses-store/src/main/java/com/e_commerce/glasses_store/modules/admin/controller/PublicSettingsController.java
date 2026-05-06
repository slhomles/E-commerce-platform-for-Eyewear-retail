package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.dto.SiteSettingDto;
import com.e_commerce.glasses_store.modules.admin.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public Settings API — Không cần authentication.
 * Frontend dùng để đọc cấu hình hiển thị sản phẩm.
 */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SiteSettingService siteSettingService;

    /**
     * GET /api/v1/settings — Lấy tất cả cấu hình hiển thị (public, không cần auth).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SiteSettingDto>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.getAllSettings()));
    }
}
