package com.e_commerce.glasses_store.modules.cart.repository;

import com.e_commerce.glasses_store.modules.cart.entity.VoucherApplicableItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherApplicableItemRepository extends JpaRepository<VoucherApplicableItem, String> {

    List<VoucherApplicableItem> findByVoucherId(String voucherId);

    void deleteByVoucherId(String voucherId);
}
