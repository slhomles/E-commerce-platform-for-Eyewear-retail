package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.request.CreateVoucherRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.*;
import com.e_commerce.glasses_store.modules.admin.service.AdminVoucherService;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import com.e_commerce.glasses_store.modules.cart.entity.Voucher;
import com.e_commerce.glasses_store.modules.cart.entity.VoucherApplicableItem;
import com.e_commerce.glasses_store.modules.cart.entity.VoucherUsage;
import com.e_commerce.glasses_store.modules.cart.repository.*;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.product.repository.CategoryRepository;
import com.e_commerce.glasses_store.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminVoucherServiceImpl implements AdminVoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final VoucherApplicableItemRepository applicableItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherListResponse> getAllVouchers(String keyword, String status, String discountType, Pageable pageable) {
        Specification<Voucher> spec = Specification
                .where(VoucherSpecification.hasKeyword(keyword))
                .and(VoucherSpecification.hasStatus(status))
                .and(VoucherSpecification.hasDiscountType(discountType));

        return voucherRepository.findAll(spec, pageable).map(this::toListResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + id));
        return toDetailResponse(voucher);
    }

    @Override
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        // Validate uniqueness
        if (voucherRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new IllegalArgumentException("Voucher code already exists: " + request.getCode());
        }

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Validate percentage
        Voucher.DiscountType discountType = Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase());
        if (discountType == Voucher.DiscountType.PERCENTAGE && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
        }

        Voucher voucher = Voucher.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(discountType)
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .perUserLimit(request.getPerUserLimit())
                .applicableTo(Voucher.ApplicableTo.valueOf(request.getApplicableTo().toUpperCase()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Voucher saved = voucherRepository.save(voucher);

        // Create applicable items if targeting
        if (request.getApplicableItemIds() != null && !request.getApplicableItemIds().isEmpty()
                && saved.getApplicableTo() != Voucher.ApplicableTo.ALL) {
            createApplicableItems(saved, request.getApplicableItemIds());
        }

        log.info("Voucher created: {} ({})", saved.getCode(), saved.getId());
        return toDetailResponse(saved);
    }

    @Override
    public VoucherResponse updateVoucher(String id, CreateVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + id));

        // Validate code uniqueness if changed
        if (!voucher.getCode().equalsIgnoreCase(request.getCode())
                && voucherRepository.existsByCodeAndIdNot(request.getCode().toUpperCase(), id)) {
            throw new IllegalArgumentException("Voucher code already exists: " + request.getCode());
        }

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Voucher.DiscountType discountType = Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase());
        if (discountType == Voucher.DiscountType.PERCENTAGE && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
        }

        voucher.setCode(request.getCode().toUpperCase());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(discountType);
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setPerUserLimit(request.getPerUserLimit());
        voucher.setApplicableTo(Voucher.ApplicableTo.valueOf(request.getApplicableTo().toUpperCase()));
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // Recreate applicable items
        voucher.getApplicableItems().clear();
        voucherRepository.saveAndFlush(voucher);

        if (request.getApplicableItemIds() != null && !request.getApplicableItemIds().isEmpty()
                && voucher.getApplicableTo() != Voucher.ApplicableTo.ALL) {
            createApplicableItems(voucher, request.getApplicableItemIds());
        }

        Voucher saved = voucherRepository.save(voucher);
        log.info("Voucher updated: {} ({})", saved.getCode(), saved.getId());
        return toDetailResponse(saved);
    }

    @Override
    public void deleteVoucher(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + id));

        if (voucher.getUsedCount() > 0) {
            // Soft delete: deactivate instead of deleting to preserve order history
            voucher.setIsActive(false);
            voucherRepository.save(voucher);
            log.info("Voucher deactivated (has {} usages): {} ({})", voucher.getUsedCount(), voucher.getCode(), voucher.getId());
        } else {
            voucherRepository.delete(voucher);
            log.info("Voucher deleted: {} ({})", voucher.getCode(), id);
        }
    }

    @Override
    public void toggleVoucherActive(String id, boolean active) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + id));
        voucher.setIsActive(active);
        voucherRepository.save(voucher);
        log.info("Voucher {} {}: {}", voucher.getCode(), active ? "activated" : "deactivated", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherUsageResponse> getVoucherUsages(String voucherId, Pageable pageable) {
        voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + voucherId));

        return voucherUsageRepository.findByVoucherIdOrderByUsedAtDesc(voucherId, pageable)
                .map(this::toUsageResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherStatsResponse getVoucherStats() {
        long totalVouchers = voucherRepository.count();
        long totalUsages = voucherUsageRepository.count();

        LocalDateTime now = LocalDateTime.now();

        // Count active vouchers
        Specification<Voucher> activeSpec = VoucherSpecification.hasStatus("ACTIVE");
        long activeVouchers = voucherRepository.count(activeSpec);

        // Count expired vouchers
        Specification<Voucher> expiredSpec = VoucherSpecification.hasStatus("EXPIRED");
        long expiredVouchers = voucherRepository.count(expiredSpec);

        // Sum discount given from orders with voucher codes
        BigDecimal totalDiscountGiven = orderRepository.findAll().stream()
                .filter(o -> o.getVoucherCode() != null && o.getDiscountAmount() != null)
                .map(Order::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return VoucherStatsResponse.builder()
                .totalVouchers(totalVouchers)
                .activeVouchers(activeVouchers)
                .expiredVouchers(expiredVouchers)
                .totalUsages(totalUsages)
                .totalDiscountGiven(totalDiscountGiven)
                .build();
    }

    // ==================== Private Helpers ====================

    private void createApplicableItems(Voucher voucher, List<String> itemIds) {
        VoucherApplicableItem.ItemType itemType = voucher.getApplicableTo() == Voucher.ApplicableTo.CATEGORY
                ? VoucherApplicableItem.ItemType.CATEGORY
                : VoucherApplicableItem.ItemType.PRODUCT;

        List<VoucherApplicableItem> items = new ArrayList<>();
        for (String itemId : itemIds) {
            VoucherApplicableItem item = VoucherApplicableItem.builder()
                    .voucher(voucher)
                    .itemType(itemType)
                    .itemId(itemId)
                    .build();
            items.add(item);
        }
        applicableItemRepository.saveAll(items);
        voucher.getApplicableItems().addAll(items);
    }

    private String computeStatus(Voucher v) {
        if (!v.getIsActive()) return "INACTIVE";
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(v.getEndDate())) return "EXPIRED";
        if (now.isBefore(v.getStartDate())) return "UPCOMING";
        if (v.getUsageLimit() != null && v.getUsedCount() >= v.getUsageLimit()) return "DEPLETED";
        return "ACTIVE";
    }

    private VoucherListResponse toListResponse(Voucher v) {
        return VoucherListResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .discountType(v.getDiscountType().name())
                .discountValue(v.getDiscountValue())
                .minOrderAmount(v.getMinOrderAmount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .perUserLimit(v.getPerUserLimit())
                .applicableTo(v.getApplicableTo().name())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .isActive(v.getIsActive())
                .status(computeStatus(v))
                .createdAt(v.getCreatedAt())
                .build();
    }

    private VoucherResponse toDetailResponse(Voucher v) {
        List<VoucherResponse.ApplicableItemResponse> applicableItems = v.getApplicableItems().stream()
                .map(item -> {
                    String itemName = resolveItemName(item);
                    return VoucherResponse.ApplicableItemResponse.builder()
                            .itemId(item.getItemId())
                            .itemType(item.getItemType().name())
                            .itemName(itemName)
                            .build();
                })
                .toList();

        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .discountType(v.getDiscountType().name())
                .discountValue(v.getDiscountValue())
                .minOrderAmount(v.getMinOrderAmount())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .perUserLimit(v.getPerUserLimit())
                .applicableTo(v.getApplicableTo().name())
                .applicableItems(applicableItems)
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .isActive(v.getIsActive())
                .status(computeStatus(v))
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    private String resolveItemName(VoucherApplicableItem item) {
        if (item.getItemType() == VoucherApplicableItem.ItemType.CATEGORY) {
            return categoryRepository.findById(item.getItemId())
                    .map(c -> c.getName())
                    .orElse("Unknown Category");
        } else {
            return productRepository.findById(item.getItemId())
                    .map(p -> p.getName())
                    .orElse("Unknown Product");
        }
    }

    private VoucherUsageResponse toUsageResponse(VoucherUsage usage) {
        String userFullName = "Unknown";
        String userEmail = "";
        if (usage.getUserId() != null) {
            User user = userRepository.findById(usage.getUserId()).orElse(null);
            if (user != null) {
                userFullName = user.getFullName();
                userEmail = user.getEmail();
            }
        }

        String orderCode = null;
        if (usage.getOrderId() != null) {
            orderCode = orderRepository.findById(usage.getOrderId())
                    .map(Order::getCode)
                    .orElse(null);
        }

        return VoucherUsageResponse.builder()
                .id(usage.getId())
                .userId(usage.getUserId())
                .userFullName(userFullName)
                .userEmail(userEmail)
                .orderId(usage.getOrderId())
                .orderCode(orderCode)
                .usedAt(usage.getUsedAt())
                .build();
    }
}
