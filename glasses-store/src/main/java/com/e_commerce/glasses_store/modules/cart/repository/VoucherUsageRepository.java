package com.e_commerce.glasses_store.modules.cart.repository;

import com.e_commerce.glasses_store.modules.cart.entity.VoucherUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, String> {

    int countByVoucherIdAndUserId(String voucherId, String userId);

    Page<VoucherUsage> findByVoucherIdOrderByUsedAtDesc(String voucherId, Pageable pageable);
}
