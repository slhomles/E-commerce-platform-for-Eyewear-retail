package com.e_commerce.glasses_store.modules.cart.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.cart.dto.*;
import com.e_commerce.glasses_store.modules.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Cart APIs — theo API Contract.
 * Yêu cầu user đã đăng nhập.
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/v1/cart — Lấy giỏ hàng hiện tại.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(user.getId())));
    }

    /**
     * POST /api/v1/cart/add — Thêm sản phẩm vào giỏ.
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(user.getId(), request.variantId(), request.quantity());
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    /**
     * PUT /api/v1/cart/update — Cập nhật số lượng.
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItem(user.getId(), request.itemId(), request.quantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    /**
     * DELETE /api/v1/cart/remove — Xóa item khỏi giỏ.
     */
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal User user,
            @RequestParam String itemId) {
        CartResponse cart = cartService.removeItem(user.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    /**
     * POST /api/v1/cart/voucher — Áp dụng voucher.
     */
    @PostMapping("/voucher")
    public ResponseEntity<ApiResponse<CartResponse>> applyVoucher(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ApplyVoucherRequest request) {
        CartResponse cart = cartService.applyVoucher(user.getId(), request.code());
        return ResponseEntity.ok(ApiResponse.success("Voucher applied", cart));
    }
}
