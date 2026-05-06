package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.SiteSettingDto;

import java.util.List;

public interface SiteSettingService {

    /** Lấy tất cả cấu hình */
    List<SiteSettingDto> getAllSettings();

    /** Cập nhật một cấu hình — validate min/max */
    SiteSettingDto updateSetting(String key, String value);

    /**
     * Lấy giá trị int của setting, fallback về defaultValue nếu không tìm thấy hoặc lỗi parse.
     * Dùng nội bộ từ các controller khác.
     */
    int getIntValue(String key, int defaultValue);
}
