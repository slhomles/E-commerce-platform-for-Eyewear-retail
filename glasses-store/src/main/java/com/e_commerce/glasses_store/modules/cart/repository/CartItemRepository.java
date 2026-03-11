package com.e_commerce.glasses_store.modules.cart.repository;

import com.e_commerce.glasses_store.modules.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    Optional<CartItem> findByCartIdAndProductVariantId(String cartId, String variantId);
}
