package com.e_commerce.glasses_store.modules.admin.dto;

public record SiteSettingDto(
    Long id,
    String key,
    String value,
    String description,
    Integer minValue,
    Integer maxValue
) {}
