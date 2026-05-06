package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.SiteSettingDto;
import com.e_commerce.glasses_store.modules.admin.entity.SiteSetting;
import com.e_commerce.glasses_store.modules.admin.repository.SiteSettingRepository;
import com.e_commerce.glasses_store.modules.admin.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SiteSettingServiceImpl implements SiteSettingService {

    private final SiteSettingRepository siteSettingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SiteSettingDto> getAllSettings() {
        return siteSettingRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public SiteSettingDto updateSetting(String key, String value) {
        SiteSetting setting = siteSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + key));

        // Validate giá trị số nằm trong [minValue, maxValue]
        try {
            int intVal = Integer.parseInt(value.trim());
            if (setting.getMinValue() != null && intVal < setting.getMinValue()) {
                throw new IllegalArgumentException(
                    "Giá trị tối thiểu cho '" + key + "' là " + setting.getMinValue());
            }
            if (setting.getMaxValue() != null && intVal > setting.getMaxValue()) {
                throw new IllegalArgumentException(
                    "Giá trị tối đa cho '" + key + "' là " + setting.getMaxValue());
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Giá trị phải là số nguyên: " + value);
        }

        setting.setSettingValue(value.trim());
        setting = siteSettingRepository.save(setting);
        log.info("Site setting updated: {} = {}", key, value);
        return toDto(setting);
    }

    @Override
    @Transactional(readOnly = true)
    public int getIntValue(String key, int defaultValue) {
        return siteSettingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return Integer.parseInt(s.getSettingValue());
                    } catch (NumberFormatException e) {
                        log.warn("Invalid int value for setting {}: {}", key, s.getSettingValue());
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    private SiteSettingDto toDto(SiteSetting s) {
        return new SiteSettingDto(
            s.getId(),
            s.getSettingKey(),
            s.getSettingValue(),
            s.getDescription(),
            s.getMinValue(),
            s.getMaxValue()
        );
    }
}
