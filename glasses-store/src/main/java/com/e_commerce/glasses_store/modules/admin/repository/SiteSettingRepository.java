package com.e_commerce.glasses_store.modules.admin.repository;

import com.e_commerce.glasses_store.modules.admin.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {
    Optional<SiteSetting> findBySettingKey(String settingKey);
    boolean existsBySettingKey(String settingKey);
}
