package com.e_commerce.glasses_store.modules.cart.service.impl;

import com.e_commerce.glasses_store.modules.cart.dto.CartResponse;
import com.e_commerce.glasses_store.modules.cart.entity.*;
import com.e_commerce.glasses_store.modules.cart.exception.InsufficientStockException;
import com.e_commerce.glasses_store.modules.cart.repository.*;
import com.e_commerce.glasses_store.modules.cart.service.CartService;
import com.e_commerce.glasses_store.modules.product.entity.InventoryStock;
import com.e_commerce.glasses_store.modules.product.entity.Product;
import com.e_commerce.glasses_store.modules.product.entity.ProductVariant;
import com.e_commerce.glasses_store.modules.product.repository.InventoryStockRepository;
import com.e_commerce.glasses_store.modules.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse addItem(String userId, String variantId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + variantId));

        // Validate stock
        validateStock(variant, quantity);

        // Upsert: nếu đã có variant trong giỏ → cộng dồn quantity
        Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variantId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + quantity;
            validateStock(variant, newQty);
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(cart);
    }

    @Override
    public CartResponse updateItem(String userId, String itemId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        validateStock(item.getProductVariant(), quantity);
        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeItem(String userId, String itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return buildCartResponse(cart);
    }

    @Override
    public CartResponse applyVoucher(String userId, String voucherCode) {
        Cart cart = getOrCreateCart(userId);

        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found: " + voucherCode));

        if (!voucher.isValid()) {
            throw new IllegalArgumentException("Voucher is expired or has reached its usage limit");
        }

        cart.setVoucherCode(voucherCode);
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    // ==================== Private Helpers ====================

    /**
     * Lấy hoặc tạo cart cho user (lazy initialization).
     */
    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Validate tồn kho — throw InsufficientStockException nếu không đủ.
     */
    private void validateStock(ProductVariant variant, int requestedQty) {
        InventoryStock stock = inventoryStockRepository.findByProductVariantId(variant.getId())
                .orElse(null);
        if (stock == null || !stock.hasStock(requestedQty)) {
            int available = stock != null ? stock.getAvailableQuantity() : 0;
            throw new InsufficientStockException(variant.getSku(), requestedQty, available);
        }
    }

    /**
     * Build CartResponse với tính toán subtotal, discount, total.
     */
    private CartResponse buildCartResponse(Cart cart) {
        // Refresh items
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartResponse.CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate voucher discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (cart.getVoucherCode() != null) {
            Optional<Voucher> voucher = voucherRepository.findByCode(cart.getVoucherCode());
            if (voucher.isPresent() && voucher.get().isValid()) {
                discountAmount = voucher.get().calculateDiscount(subtotal);
            } else {
                // Voucher hết hạn → tự động remove
                cart.setVoucherCode(null);
                cartRepository.save(cart);
            }
        }

        int totalItems = itemResponses.stream().mapToInt(CartResponse.CartItemResponse::quantity).sum();

        return new CartResponse(
                cart.getId(),
                itemResponses,
                totalItems,
                subtotal,
                cart.getVoucherCode(),
                discountAmount,
                subtotal.subtract(discountAmount));
    }

    private CartResponse.CartItemResponse toCartItemResponse(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        Product product = variant.getProduct();

        BigDecimal unitPrice = product.getSalePrice() != null
                ? product.getSalePrice().add(variant.getPriceAdjustment())
                : product.getBasePrice().add(variant.getPriceAdjustment());

        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        int stockAvailable = variant.getInventoryStock() != null
                ? variant.getInventoryStock().getAvailableQuantity()
                : 0;

        return new CartResponse.CartItemResponse(
                item.getId(),
                variant.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                variant.getColorName(),
                variant.getColorHex(),
                variant.getImageUrl(),
                variant.getSku(),
                unitPrice,
                item.getQuantity(),
                lineTotal,
                stockAvailable);
    }
}
