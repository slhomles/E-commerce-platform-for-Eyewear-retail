package com.e_commerce.glasses_store.modules.order.service.impl;

import com.e_commerce.glasses_store.modules.cart.entity.Cart;
import com.e_commerce.glasses_store.modules.cart.entity.CartItem;
import com.e_commerce.glasses_store.modules.cart.entity.Voucher;
import com.e_commerce.glasses_store.modules.cart.repository.CartItemRepository;
import com.e_commerce.glasses_store.modules.cart.repository.CartRepository;
import com.e_commerce.glasses_store.modules.cart.repository.VoucherRepository;
import com.e_commerce.glasses_store.modules.order.dto.request.PlaceOrderRequest;
import com.e_commerce.glasses_store.modules.order.dto.request.UpdateOrderStatusRequest;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderListResponse;
import com.e_commerce.glasses_store.modules.order.dto.response.OrderResponse;
import com.e_commerce.glasses_store.modules.order.entity.Order;
import com.e_commerce.glasses_store.modules.order.entity.OrderItem;
import com.e_commerce.glasses_store.modules.order.entity.OrderStatusHistory;
import com.e_commerce.glasses_store.modules.order.exception.InvalidOrderStateException;
import com.e_commerce.glasses_store.modules.order.exception.OrderNotFoundException;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.order.repository.OrderSpecification;
import com.e_commerce.glasses_store.modules.order.service.OrderService;
import com.e_commerce.glasses_store.modules.product.entity.Product;
import com.e_commerce.glasses_store.modules.product.entity.ProductVariant;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Implementation of OrderService.
 * Xử lý toàn bộ business logic: đặt hàng, filter, cập nhật trạng thái.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== User APIs ====================

    @Override
    public OrderResponse placeOrder(String userId, PlaceOrderRequest request) {
        // 1. Lấy cart của user
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // 2. Tính toán tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            Product product = variant.getProduct();
            BigDecimal unitPrice = product.getSalePrice() != null
                    ? product.getSalePrice().add(variant.getPriceAdjustment())
                    : product.getBasePrice().add(variant.getPriceAdjustment());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        // 3. Tính phí ship & discount
        BigDecimal shippingFee = BigDecimal.ZERO; // Có thể mở rộng sau
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null) {
            Optional<Voucher> voucher = voucherRepository.findByCode(request.getVoucherCode());
            if (voucher.isPresent() && voucher.get().isValid()) {
                discountAmount = voucher.get().calculateDiscount(totalAmount);
            }
        }
        BigDecimal finalAmount = totalAmount.add(shippingFee).subtract(discountAmount);

        // 4. Serialize shipping address to JSON
        String shippingAddressJson;
        try {
            shippingAddressJson = objectMapper.writeValueAsString(request.getShippingAddress());
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid shipping address data");
        }

        // 5. Tạo Order
        Order order = Order.builder()
                .code(generateOrderCode())
                .userId(userId)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.UNPAID)
                .paymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .shippingAddressJson(shippingAddressJson)
                .customerNote(request.getCustomerNote())
                .voucherCode(request.getVoucherCode())
                .build();

        // 6. Tạo OrderItems (snapshot data từ cart)
        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            Product product = variant.getProduct();
            BigDecimal unitPrice = product.getSalePrice() != null
                    ? product.getSalePrice().add(variant.getPriceAdjustment())
                    : product.getBasePrice().add(variant.getPriceAdjustment());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariantId(variant.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .sku(variant.getSku())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            order.getItems().add(orderItem);
        }

        // 7. Tạo initial status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(Order.OrderStatus.PENDING)
                .note("Đơn hàng được tạo")
                .build();
        order.getStatusHistory().add(history);

        // 8. Lưu order
        Order savedOrder = orderRepository.save(order);

        // 9. Xóa cart items sau khi đặt hàng thành công
        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();
        cart.setVoucherCode(null);
        cartRepository.save(cart);

        log.info("Order placed successfully: {} for user: {}", savedOrder.getCode(), userId);

        return toOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getMyOrders(String userId, String status, String paymentStatus,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            BigDecimal minAmount, BigDecimal maxAmount,
            Pageable pageable) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.hasUser(userId))
                .and(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.hasPaymentStatus(paymentStatus))
                .and(OrderSpecification.hasKeyword(keyword))
                .and(OrderSpecification.createdBetween(fromDate, toDate))
                .and(OrderSpecification.amountBetween(minAmount, maxAmount));

        return orderRepository.findAll(spec, pageable).map(this::toOrderListResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Kiểm tra quyền sở hữu
        if (!order.getUserId().equals(userId)) {
            throw new OrderNotFoundException(orderId);
        }

        return toOrderResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getUserId().equals(userId)) {
            throw new OrderNotFoundException(orderId);
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new InvalidOrderStateException(
                    "Cannot cancel order with status: " + order.getStatus()
                            + ". Only PENDING orders can be cancelled.");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(Order.OrderStatus.CANCELLED)
                .note("Khách hàng hủy đơn")
                .build();
        order.getStatusHistory().add(history);

        Order saved = orderRepository.save(order);
        log.info("Order cancelled: {} by user: {}", orderId, userId);

        return toOrderResponse(saved);
    }

    // ==================== Admin APIs ====================

    @Override
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getAllOrders(String status, String paymentStatus, String paymentMethod,
            String keyword, LocalDateTime fromDate, LocalDateTime toDate,
            BigDecimal minAmount, BigDecimal maxAmount,
            Pageable pageable) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.hasPaymentStatus(paymentStatus))
                .and(OrderSpecification.hasPaymentMethod(paymentMethod))
                .and(OrderSpecification.hasKeyword(keyword))
                .and(OrderSpecification.createdBetween(fromDate, toDate))
                .and(OrderSpecification.amountBetween(minAmount, maxAmount));

        return orderRepository.findAll(spec, pageable).map(this::toOrderListResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetailAdmin(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return toOrderResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        Order.OrderStatus newStatus = null;
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
        }

        // Validate trạng thái chuyển đổi
        if (newStatus != null) {
            validateStatusTransition(order.getStatus(), newStatus);
            order.setStatus(newStatus);
        }

        // Auto-update payment status khi cần, HOẶC ghi đè bằng request explicit.
        if (request.getPaymentStatus() != null && !request.getPaymentStatus().isEmpty()) {
            order.setPaymentStatus(Order.PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase()));
        } else if (newStatus == Order.OrderStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        } else if (newStatus == Order.OrderStatus.CANCELLED
                && order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        }

        if (newStatus != null) {
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status(newStatus)
                    .note(request.getNote())
                    .build();
            order.getStatusHistory().add(history);
        }

        Order saved = orderRepository.save(order);
        log.info("Order {} status updated to {} by admin", orderId, newStatus);

        return toOrderResponse(saved);
    }

    // ==================== Private Helpers ====================

    /**
     * Generate mã đơn hàng: ORD-YYMM-XXXX (random 4 chữ số).
     */
    private String generateOrderCode() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMM"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "ORD-" + datePrefix + "-" + random;
    }

    /**
     * Validate chuyển đổi trạng thái hợp lệ.
     */
    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        if (false && current == Order.OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cannot change status of a cancelled order");
        }
        if (false && current == Order.OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Cannot change status of a delivered order");
        }
    }

    /**
     * Map Order entity → OrderResponse (chi tiết).
     */
    private OrderResponse toOrderResponse(Order order) {
        // Parse shipping address JSON
        OrderResponse.ShippingAddressResponse shippingAddress = null;
        if (order.getShippingAddressJson() != null) {
            try {
                shippingAddress = objectMapper.readValue(
                        order.getShippingAddressJson(),
                        OrderResponse.ShippingAddressResponse.class);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse shipping address JSON for order: {}", order.getId());
            }
        }

        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productVariantId(item.getProductVariantId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .sku(item.getSku())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        List<OrderResponse.StatusHistoryResponse> historyResponses = order.getStatusHistory().stream()
                .map(h -> OrderResponse.StatusHistoryResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus().name())
                        .note(h.getNote())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .shippingAddress(shippingAddress)
                .customerNote(order.getCustomerNote())
                .trackingNumber(order.getTrackingNumber())
                .voucherCode(order.getVoucherCode())
                .items(itemResponses)
                .statusHistory(historyResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Map Order entity → OrderListResponse (lightweight cho danh sách).
     */
    private OrderListResponse toOrderListResponse(Order order) {
        int totalItems = order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        String fullName = null;
        if (order.getShippingAddressJson() != null) {
            try {
                OrderResponse.ShippingAddressResponse shippingAddress = objectMapper.readValue(
                        order.getShippingAddressJson(),
                        OrderResponse.ShippingAddressResponse.class);
                if (shippingAddress != null && shippingAddress.getFullName() != null) {
                    fullName = shippingAddress.getFullName();
                }
            } catch (Exception e) {
                log.warn("Failed to parse shipping address JSON for order list: {}", order.getId());
            }
        }

        // Fallback to registered User's name if shipping name is missing
        if ((fullName == null || fullName.equals("Unknown")) && order.getUserId() != null) {
            fullName = userRepository.findById(order.getUserId())
                    .map(User::getFullName)
                    .orElse("Unknown Customer");
        }

        if (fullName == null) fullName = "Unknown";

        return OrderListResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .userFullName(fullName)
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .finalAmount(order.getFinalAmount())
                .totalItems(totalItems)
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Override
    public void deleteOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        orderRepository.delete(order);
        log.info("Order deleted successfully: {}", orderId);
    }
}
