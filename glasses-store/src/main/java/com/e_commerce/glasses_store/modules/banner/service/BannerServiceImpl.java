package com.e_commerce.glasses_store.modules.banner.service;

import com.e_commerce.glasses_store.modules.banner.dto.BannerResponse;
import com.e_commerce.glasses_store.modules.banner.dto.CreateBannerRequest;
import com.e_commerce.glasses_store.modules.banner.dto.UpdateBannerRequest;
import com.e_commerce.glasses_store.modules.banner.entity.Banner;
import com.e_commerce.glasses_store.modules.banner.repository.BannerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        LocalDateTime now = LocalDateTime.now();
        List<Banner> banners = bannerRepository.findActiveBanners(now);
        log.info("Found {} active banners at {}", banners.size(), now);
        return banners.stream()
                .map(BannerResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BannerResponse> getAllBanners(Pageable pageable) {
        return bannerRepository.findAllByOrderByPositionAsc(pageable)
                .map(BannerResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(String id) {
        Banner banner = findBannerOrThrow(id);
        return BannerResponse.fromEntity(banner);
    }

    @Override
    public BannerResponse createBanner(CreateBannerRequest request) {
        // Validate thời gian
        validateDateRange(request.getStartDate(), request.getEndDate());

        Banner banner = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .linkType(request.getLinkType())
                .linkValue(request.getLinkValue())
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .isActive(true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .displayStyle(request.getDisplayStyle() != null ? request.getDisplayStyle() : Banner.DisplayStyle.IMAGE)
                .tag(request.getTag())
                .highlight(request.getHighlight())
                .bgColor(request.getBgColor() != null ? request.getBgColor() : "#E91E8C")
                .textColor(request.getTextColor() != null ? request.getTextColor() : "#ffffff")
                .ctaText(request.getCtaText() != null ? request.getCtaText() : "SHOP NOW")
                .build();

        banner = bannerRepository.save(banner);
        log.info("Created banner: id={}, title={}", banner.getId(), banner.getTitle());
        return BannerResponse.fromEntity(banner);
    }

    @Override
    public BannerResponse updateBanner(String id, UpdateBannerRequest request) {
        Banner banner = findBannerOrThrow(id);

        if (request.getTitle() != null) {
            banner.setTitle(request.getTitle());
        }
        if (request.getSubtitle() != null) {
            banner.setSubtitle(request.getSubtitle());
        }
        if (request.getImageUrl() != null) {
            banner.setImageUrl(request.getImageUrl());
        }
        if (request.getLinkType() != null) {
            banner.setLinkType(request.getLinkType());
        }
        if (request.getLinkValue() != null) {
            banner.setLinkValue(request.getLinkValue());
        }
        if (request.getPosition() != null) {
            banner.setPosition(request.getPosition());
        }
        if (request.getIsActive() != null) {
            banner.setIsActive(request.getIsActive());
        }
        if (request.getDisplayStyle() != null) {
            banner.setDisplayStyle(request.getDisplayStyle());
        }
        if (request.getTag() != null) {
            banner.setTag(request.getTag());
        }
        if (request.getHighlight() != null) {
            banner.setHighlight(request.getHighlight());
        }
        if (request.getBgColor() != null) {
            banner.setBgColor(request.getBgColor());
        }
        if (request.getTextColor() != null) {
            banner.setTextColor(request.getTextColor());
        }
        if (request.getCtaText() != null) {
            banner.setCtaText(request.getCtaText());
        }

        // Validate và cập nhật ngày
        LocalDateTime startDate = request.getStartDate() != null ? request.getStartDate() : banner.getStartDate();
        LocalDateTime endDate = request.getEndDate() != null ? request.getEndDate() : banner.getEndDate();
        validateDateRange(startDate, endDate);
        banner.setStartDate(startDate);
        banner.setEndDate(endDate);

        banner = bannerRepository.save(banner);
        log.info("Updated banner: id={}", banner.getId());
        return BannerResponse.fromEntity(banner);
    }

    @Override
    public void deleteBanner(String id) {
        Banner banner = findBannerOrThrow(id);
        bannerRepository.delete(banner);
        log.info("Deleted banner: id={}, title={}", id, banner.getTitle());
    }

    @Override
    public BannerResponse toggleBannerStatus(String id) {
        Banner banner = findBannerOrThrow(id);
        banner.setIsActive(!banner.getIsActive());
        banner = bannerRepository.save(banner);
        log.info("Toggled banner status: id={}, isActive={}", id, banner.getIsActive());
        return BannerResponse.fromEntity(banner);
    }

    // ==================== Private Helpers ====================

    private Banner findBannerOrThrow(String id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner not found with id: " + id));
    }

    private void validateDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
    }
}
