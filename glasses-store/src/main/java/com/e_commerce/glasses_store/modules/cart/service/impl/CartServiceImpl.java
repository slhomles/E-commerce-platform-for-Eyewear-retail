package com.e_commerce.glasses_store.modules.cart.service.impl;

import com.e_commerce.glasses_store.modules.cart.dto.AddToCartRequest;
import com.e_commerce.glasses_store.modules.cart.dto.AvailableVoucherResponse;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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
    private final VoucherUsageRepository voucherUsageRepository;

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
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại: " + voucherCode));

        if (!voucher.isValid()) {
            throw new IllegalArgumentException("Voucher đã hết hạn hoặc đã hết lượt sử dụng");
        }

        // Check per-user usage limit
        if (voucher.getPerUserLimit() != null) {
            int userUsageCount = voucherUsageRepository.countByVoucherIdAndUserId(voucher.getId(), userId);
            if (userUsageCount >= voucher.getPerUserLimit()) {
                throw new IllegalArgumentException("Bạn đã sử dụng hết lượt cho voucher này");
            }
        }

        // Check targeting: verify cart items match applicable categories/products
        if (voucher.getApplicableTo() != Voucher.ApplicableTo.ALL) {
            validateVoucherTargeting(voucher, cart);
        }

        // Check minimum order amount
        if (voucher.getMinOrderAmount() != null && voucher.getMinOrderAmount().compareTo(BigDecimal.ZERO) > 0) {
            List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
            BigDecimal currentSubtotal = items.stream()
                    .map(item -> {
                        Product product = item.getProductVariant().getProduct();
                        BigDecimal unitPrice = product.getSalePrice() != null
                                ? product.getSalePrice().add(item.getProductVariant().getPriceAdjustment())
                                : product.getBasePrice().add(item.getProductVariant().getPriceAdjustment());
                        return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (currentSubtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
                throw new IllegalArgumentException(
                        String.format("Đơn hàng tối thiểu %.0f VNĐ để sử dụng voucher này",
                                voucher.getMinOrderAmount()));
            }
        }

        cart.setVoucherCode(voucherCode);
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public List<AvailableVoucherResponse> getAvailableVouchers(String userId) {
        Cart cart = getOrCreateCart(userId);
        BigDecimal subtotal = calculateCartSubtotal(cart);

        return voucherRepository.findAll().stream()
                .filter(voucher -> canUseVoucherInCurrentCart(voucher, userId, cart, subtotal))
                .sorted(java.util.Comparator.comparing(Voucher::getEndDate))
                .map(voucher -> toAvailableVoucherResponse(voucher, subtotal))
                .toList();
    }

    @Override
    public CartResponse replaceCart(String userId, List<AddToCartRequest> items) {
        Cart cart = getOrCreateCart(userId);
        // Clear existing items
        List<CartItem> existing = cartItemRepository.findByCartId(cart.getId());
        if (!existing.isEmpty()) {
            cartItemRepository.deleteAll(existing);
            cartItemRepository.flush();
        }
        // Add new items
        List<CartItem> newItems = new ArrayList<>();
        for (AddToCartRequest req : items) {
            ProductVariant variant = variantRepository.findById(req.variantId())
                    .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + req.variantId()));
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(req.quantity())
                    .build();
            newItems.add(cartItemRepository.save(item));
        }
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeVoucher(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.setVoucherCode(null);
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
     * Validate voucher targeting — kiểm tra giỏ hàng có sản phẩm/danh mục phù hợp.
     */
    private void validateVoucherTargeting(Voucher voucher, Cart cart) {
        List<VoucherApplicableItem> applicableItems = voucher.getApplicableItems();
        if (applicableItems == null || applicableItems.isEmpty()) return;

        Set<String> applicableIds = applicableItems.stream()
                .map(VoucherApplicableItem::getItemId)
                .collect(Collectors.toSet());

        boolean hasMatch = cartItemRepository.findByCartId(cart.getId()).stream().anyMatch(cartItem -> {
            Product product = cartItem.getProductVariant().getProduct();
            if (voucher.getApplicableTo() == Voucher.ApplicableTo.PRODUCT) {
                return applicableIds.contains(product.getId());
            } else { // CATEGORY
                return product.getCategory() != null
                        && applicableIds.contains(product.getCategory().getId());
            }
        });

        if (!hasMatch) {
            throw new IllegalArgumentException("Voucher này không áp dụng cho sản phẩm trong giỏ hàng của bạn");
        }
    }

    /**
     * Validate tồn kho — throw InsufficientStockException nếu không đủ.
     */
    private void validateStock(ProductVariant variant, int requestedQty) {
        // Tạm thời bỏ qua kiểm tra tồn kho theo yêu cầu của user
        /*
        InventoryStock stock = inventoryStockRepository.findByProductVariantId(variant.getId())
                .orElse(null);
        if (stock == null || !stock.hasStock(requestedQty)) {
            int available = stock != null ? stock.getAvailableQuantity() : 0;
            throw new InsufficientStockException(variant.getSku(), requestedQty, available);
        }
        */
    }

    /**
     * Build CartResponse với tính toán subtotal, discount, total.
     */
    private CartResponse buildCartResponse(Cart cart) {
        // Use explicit query to avoid stale lazy-collection state after save()
        List<CartItem> freshItems = cartItemRepository.findByCartId(cart.getId());
        List<CartResponse.CartItemResponse> itemResponses = freshItems.stream()
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

    private boolean canUseVoucherInCurrentCart(Voucher voucher, String userId, Cart cart, BigDecimal subtotal) {
        if (!voucher.isValid()) return false;

        if (voucher.getPerUserLimit() != null) {
            int userUsageCount = voucherUsageRepository.countByVoucherIdAndUserId(voucher.getId(), userId);
            if (userUsageCount >= voucher.getPerUserLimit()) return false;
        }

        if (voucher.getMinOrderAmount() != null && subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            return false;
        }

        return isVoucherTargetingMatched(voucher, cart);
    }

    private boolean isVoucherTargetingMatched(Voucher voucher, Cart cart) {
        if (voucher.getApplicableTo() == Voucher.ApplicableTo.ALL) return true;

        List<VoucherApplicableItem> applicableItems = voucher.getApplicableItems();
        if (applicableItems == null || applicableItems.isEmpty()) return true;

        Set<String> applicableIds = applicableItems.stream()
                .map(VoucherApplicableItem::getItemId)
                .collect(Collectors.toSet());

        return cartItemRepository.findByCartId(cart.getId()).stream().anyMatch(cartItem -> {
            Product product = cartItem.getProductVariant().getProduct();
            if (voucher.getApplicableTo() == Voucher.ApplicableTo.PRODUCT) {
                return applicableIds.contains(product.getId());
            }
            return product.getCategory() != null
                    && applicableIds.contains(product.getCategory().getId());
        });
    }

    private BigDecimal calculateCartSubtotal(Cart cart) {
        return cartItemRepository.findByCartId(cart.getId()).stream()
                .map(item -> {
                    Product product = item.getProductVariant().getProduct();
                    BigDecimal unitPrice = product.getSalePrice() != null
                            ? product.getSalePrice().add(item.getProductVariant().getPriceAdjustment())
                            : product.getBasePrice().add(item.getProductVariant().getPriceAdjustment());
                    return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private AvailableVoucherResponse toAvailableVoucherResponse(Voucher voucher, BigDecimal subtotal) {
        return new AvailableVoucherResponse(
                voucher.getId(),
                voucher.getCode(),
                voucher.getDescription(),
                voucher.getDiscountType().name(),
                voucher.getDiscountValue(),
                voucher.getMinOrderAmount(),
                voucher.getMaxDiscountAmount(),
                voucher.calculateDiscount(subtotal),
                voucher.getEndDate());
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
