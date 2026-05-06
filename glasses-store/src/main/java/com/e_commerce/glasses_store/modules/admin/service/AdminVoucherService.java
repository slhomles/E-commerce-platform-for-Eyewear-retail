package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.request.CreateVoucherRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminVoucherService {

    Page<VoucherListResponse> getAllVouchers(String keyword, String status, String discountType, Pageable pageable);

    VoucherResponse getVoucherById(String id);

    VoucherResponse createVoucher(CreateVoucherRequest request);

    VoucherResponse updateVoucher(String id, CreateVoucherRequest request);

    void deleteVoucher(String id);

    void toggleVoucherActive(String id, boolean active);

    Page<VoucherUsageResponse> getVoucherUsages(String voucherId, Pageable pageable);

    VoucherStatsResponse getVoucherStats();
}
