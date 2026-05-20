package com.e_commerce.glasses_store.modules.chatbot.service.impl;

import com.e_commerce.glasses_store.modules.chatbot.dto.GeminiConversationMessage;
import com.e_commerce.glasses_store.modules.chatbot.dto.response.ChatResponse;
import com.e_commerce.glasses_store.modules.chatbot.dto.response.OrderStatusDto;
import com.e_commerce.glasses_store.modules.chatbot.dto.response.ProductCardDto;
import com.e_commerce.glasses_store.modules.chatbot.entity.ChatMessage;
import com.e_commerce.glasses_store.modules.chatbot.entity.ChatSession;
import com.e_commerce.glasses_store.modules.chatbot.repository.ChatMessageRepository;
import com.e_commerce.glasses_store.modules.chatbot.repository.ChatSessionRepository;
import com.e_commerce.glasses_store.modules.chatbot.service.ChatService;
import com.e_commerce.glasses_store.modules.order.repository.OrderRepository;
import com.e_commerce.glasses_store.modules.product.entity.Product;
import com.e_commerce.glasses_store.modules.product.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final RestClient geminiRestClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${chatbot.session.ttl-minutes:30}")
    private long ttlMinutes;

    @Value("${chatbot.history.max-messages:20}")
    private int maxHistory;

    private static final String REDIS_KEY_PREFIX = "chat:session:";

    private static final String SYSTEM_PROMPT = """
            You are a friendly and professional assistant for Glasses Store, an eyewear shop.
            You help customers find the right glasses, check order status, and answer FAQs.

            Store information:
            - Product types: FRAME, LENS, SERVICE
            - Genders: MEN, WOMEN, UNISEX, KIDS
            - Frame shapes: oval, round, square, rectangle, cat-eye, aviator, wayfarer
            - Shipping: standard 3-5 business days, express 1-2 business days
            - Returns: 30-day return policy for unused items in original packaging
            - Prescription lenses are available on supported frames. Check the supportPrescription field.

            Mandatory behavior rules:
            1. When a customer asks anything about products, eyewear, frames, lenses, fit advice,
               recommendations, availability, or price ranges, call the `searchProducts` function.
               Do not answer with a generic instruction to visit the product page.
            2. When an authenticated customer asks about a specific order code, call `lookupOrder`
               with that orderCode.
            3. When an authenticated customer asks generally about their orders or recent orders
               without a specific order code, call `listMyOrders`.
               Pass `status` when the customer asks about a specific status:
               delivered -> DELIVERED, shipping -> SHIPPING, packing -> PACKING,
               paid -> PAID, pending -> PENDING, cancelled -> CANCELLED.
               The tool returns `totalCount` and `orders` with up to 20 rows.
               When the customer asks how many orders match, use `totalCount`, not the array length.
            4. If an unauthenticated customer asks about orders, politely ask them to sign in.
            5. Reply in English by default. If the customer explicitly requests another language,
               respond in that requested language.
            6. If a tool returns no results, clearly say that no matching data was found and suggest
               another search criterion.
            """;

    public ChatServiceImpl(
            @Qualifier("geminiRestClient") RestClient geminiRestClient,
            @Qualifier("chatRedisTemplate") RedisTemplate<String, Object> redisTemplate,
            ChatSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.geminiRestClient = geminiRestClient;
        this.redisTemplate = redisTemplate;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public ChatResponse chat(String message, String sessionId, String userId) {
        // 1. Resolve or create session
        ChatSession session = resolveSession(sessionId, userId);
        String redisKey = REDIS_KEY_PREFIX + session.getId();

        // 2. Load conversation history from Redis
        List<GeminiConversationMessage> history = loadHistory(redisKey);

        // 3. Append user message
        history.add(new GeminiConversationMessage("user", message));

        // 4. Call Gemini
        Map<String, Object> payload = buildGeminiPayload(history, userId != null);
        Map<String, Object> geminiResponse = callGeminiApi(payload);

        // 5. Process response
        String reply;
        List<ProductCardDto> productCards = null;
        OrderStatusDto orderStatus = null;
        List<OrderStatusDto> orderList = null;

        Map<String, Object> functionCall = extractFunctionCall(geminiResponse);
        if (functionCall != null) {
            String funcName = (String) functionCall.get("name");
            @SuppressWarnings("unchecked")
            Map<String, Object> args = (Map<String, Object>) functionCall.getOrDefault("args", Map.of());

            if ("searchProducts".equals(funcName)) {
                productCards = executeSearchProducts(args);
                String toolResult = serializeProductResults(productCards);
                reply = getFinalReplyAfterTool(history, geminiResponse, funcName, toolResult, userId != null);
            } else if ("lookupOrder".equals(funcName) && userId != null) {
                orderStatus = executeLookupOrder(args, userId);
                String toolResult = serializeOrderResult(orderStatus);
                reply = getFinalReplyAfterTool(history, geminiResponse, funcName, toolResult, userId != null);
            } else if ("listMyOrders".equals(funcName) && userId != null) {
                Map<String, Object> toolPayload = executeListMyOrders(args, userId);
                @SuppressWarnings("unchecked")
                List<OrderStatusDto> list = (List<OrderStatusDto>) toolPayload.get("orders");
                orderList = list;
                String toolResult = serializeOrderListPayload(toolPayload);
                reply = getFinalReplyAfterTool(history, geminiResponse, funcName, toolResult, userId != null);
            } else {
                reply = extractTextReply(geminiResponse);
            }
        } else {
            reply = extractTextReply(geminiResponse);
        }

        // 6. Save updated history to Redis
        history.add(new GeminiConversationMessage("model", reply));
        if (history.size() > maxHistory) {
            history = history.subList(history.size() - maxHistory, history.size());
        }
        saveHistory(redisKey, history);

        // 7. Update session last_active
        session.setLastActive(LocalDateTime.now());
        sessionRepository.save(session);

        // 8. Persist messages to DB asynchronously (CompletableFuture avoids @Async proxy issue)
        final ChatSession finalSession = session;
        final String finalReply = reply;
        CompletableFuture.runAsync(() -> persistMessages(finalSession, message, finalReply));

        return new ChatResponse(session.getId(), reply, productCards, orderStatus, orderList);
    }

    // ==================== Session Management ====================

    private ChatSession resolveSession(String sessionId, String userId) {
        if (sessionId != null && !sessionId.isBlank()) {
            Optional<ChatSession> existing = sessionRepository.findById(sessionId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        // Create new session
        String sessionKey = UUID.randomUUID().toString();
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .sessionKey(sessionKey)
                .startedAt(LocalDateTime.now())
                .lastActive(LocalDateTime.now())
                .isActive(true)
                .build();
        return sessionRepository.save(session);
    }

    // ==================== Redis History ====================

    private List<GeminiConversationMessage> loadHistory(String redisKey) {
        try {
            Object raw = redisTemplate.opsForValue().get(redisKey);
            if (raw == null) return new ArrayList<>();
            String json = MAPPER.writeValueAsString(raw);
            return MAPPER.readValue(json, new TypeReference<List<GeminiConversationMessage>>() {});
        } catch (Exception e) {
            log.warn("Failed to load chat history from Redis for key {}: {}", redisKey, e.getMessage());
            return new ArrayList<>();
        }
    }

    private void saveHistory(String redisKey, List<GeminiConversationMessage> history) {
        try {
            redisTemplate.opsForValue().set(redisKey, history, Duration.ofMinutes(ttlMinutes));
        } catch (Exception e) {
            log.warn("Failed to save chat history to Redis for key {}: {}", redisKey, e.getMessage());
        }
    }

    // ==================== Gemini API ====================

    private Map<String, Object> buildGeminiPayload(List<GeminiConversationMessage> history, boolean authenticated) {
        // Build contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        for (GeminiConversationMessage msg : history) {
            contents.add(Map.of(
                    "role", msg.role(),
                    "parts", List.of(Map.of("text", msg.text()))
            ));
        }

        // Function declarations
        List<Map<String, Object>> functionDeclarations = new ArrayList<>();
        functionDeclarations.add(buildSearchProductsDeclaration());
        if (authenticated) {
            functionDeclarations.add(buildLookupOrderDeclaration());
            functionDeclarations.add(buildListMyOrdersDeclaration());
        }

        return Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ),
                "contents", contents,
                "tools", List.of(Map.of("function_declarations", functionDeclarations)),
                "tool_config", Map.of("function_calling_config", Map.of("mode", "AUTO"))
        );
    }

    private Map<String, Object> buildSearchProductsDeclaration() {
        return Map.of(
                "name", "searchProducts",
                "description", "Search for eyewear products based on user criteria. Call this whenever a user asks about products, glasses, frames, or wants recommendations.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "keyword", Map.of("type", "string", "description", "Search keyword for product name or description"),
                                "brand", Map.of("type", "string", "description", "Brand name filter"),
                                "gender", Map.of("type", "string", "description", "Gender filter", "enum", List.of("MEN", "WOMEN", "UNISEX", "KIDS")),
                                "frameShape", Map.of("type", "string", "description", "Frame shape filter e.g. oval, round, square, aviator"),
                                "minPrice", Map.of("type", "number", "description", "Minimum price in VND"),
                                "maxPrice", Map.of("type", "number", "description", "Maximum price in VND")
                        )
                )
        );
    }

    private Map<String, Object> buildLookupOrderDeclaration() {
        return Map.of(
                "name", "lookupOrder",
                "description", "Look up the status of a SPECIFIC order by its code, for the currently authenticated user. " +
                        "Use this only when the user provides an order code (e.g. GS-001, ABC123).",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "orderCode", Map.of("type", "string", "description", "The order code (e.g. GS-001)")
                        ),
                        "required", List.of("orderCode")
                )
        );
    }

    private Map<String, Object> buildListMyOrdersDeclaration() {
        return Map.of(
                "name", "listMyOrders",
                "description", "List recent orders of the currently authenticated user, with an optional status filter. " +
                        "Use for general order questions such as 'my orders', 'recent orders', " +
                        "'how many delivered orders do I have', or 'my delivered orders'. " +
                        "Pass `status` when the user asks about a specific status " +
                        "(DELIVERED, SHIPPING, PACKING, PAID, PENDING, CANCELLED). " +
                        "Returns up to 20 orders and a total count.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "status", Map.of(
                                        "type", "string",
                                        "description", "Optional order status filter",
                                        "enum", List.of("PENDING", "PAID", "PACKING", "SHIPPING", "DELIVERED", "CANCELLED")
                                )
                        )
                )
        );
    }

    private Map<String, Object> callGeminiApi(Map<String, Object> payload) {
        String url = "/models/" + model + ":generateContent?key=" + apiKey;
        try {
            Map<String, Object> response = geminiRestClient.post()
                    .uri(url)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return response != null ? response : Map.of();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Gemini API call failed ({}): body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI service unavailable. Please try again later.");
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI service unavailable. Please try again later.");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractFunctionCall(Map<String, Object> geminiResponse) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiResponse.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) return null;
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return null;
            for (Map<String, Object> part : parts) {
                if (part.containsKey("functionCall")) {
                    return (Map<String, Object>) part.get("functionCall");
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract function call from Gemini response: {}", e.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String extractTextReply(Map<String, Object> geminiResponse) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiResponse.get("candidates");
            if (candidates == null || candidates.isEmpty()) return fallbackReply();
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) return fallbackReply();
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return fallbackReply();
            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> part : parts) {
                if (part.containsKey("text")) {
                    sb.append(part.get("text"));
                }
            }
            return sb.isEmpty() ? fallbackReply() : sb.toString().trim();
        } catch (Exception e) {
            log.warn("Failed to extract text reply: {}", e.getMessage());
            return fallbackReply();
        }
    }

    private String fallbackReply() {
        return "Sorry, I cannot process your request right now. Please try again later.";
    }

    @SuppressWarnings("unchecked")
    private String getFinalReplyAfterTool(List<GeminiConversationMessage> history,
                                           Map<String, Object> firstGeminiResponse,
                                           String funcName, String toolResult, boolean authenticated) {
        // Rebuild history as Gemini contents
        List<Map<String, Object>> contents = new ArrayList<>();
        for (GeminiConversationMessage msg : history) {
            contents.add(Map.of(
                    "role", msg.role(),
                    "parts", List.of(Map.of("text", msg.text()))
            ));
        }
        // Include the model's functionCall response (required by Gemini's multi-turn function calling)
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) firstGeminiResponse.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> modelContent = (Map<String, Object>) candidates.get(0).get("content");
                if (modelContent != null) {
                    contents.add(modelContent);
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract model functionCall content for tool turn: {}", e.getMessage());
        }
        // Append the function response from our tool
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of(
                        "functionResponse", Map.of(
                                "name", funcName,
                                "response", Map.of("result", toolResult)
                        )
                ))
        ));

        List<Map<String, Object>> functionDeclarations = new ArrayList<>();
        functionDeclarations.add(buildSearchProductsDeclaration());
        if (authenticated) {
            functionDeclarations.add(buildLookupOrderDeclaration());
            functionDeclarations.add(buildListMyOrdersDeclaration());
        }

        Map<String, Object> payload = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))),
                "contents", contents,
                "tools", List.of(Map.of("function_declarations", functionDeclarations)),
                "tool_config", Map.of("function_calling_config", Map.of("mode", "AUTO"))
        );

        Map<String, Object> response = callGeminiApi(payload);
        return extractTextReply(response);
    }

    // ==================== Tool Executors ====================

    private List<ProductCardDto> executeSearchProducts(Map<String, Object> args) {
        String keyword = (String) args.getOrDefault("keyword", "");
        String gender = (String) args.get("gender");
        String frameShape = (String) args.get("frameShape");
        Number minPrice = (Number) args.get("minPrice");
        Number maxPrice = (Number) args.get("maxPrice");

        List<Product> products = new ArrayList<>();
        if (keyword != null && !keyword.isBlank()) {
            // 1. MySQL FULLTEXT (requires tokens >= 4 characters).
            try {
                products = productRepository.fulltextSearch(keyword, PageRequest.of(0, 10)).getContent();
            } catch (Exception e) {
                log.warn("fulltextSearch failed for keyword '{}': {}", keyword, e.getMessage());
            }
            // 2. Fallback LIKE for short or accented keywords.
            if (products.isEmpty()) {
                products = productRepository.searchByLike(keyword.trim(), PageRequest.of(0, 10));
            }
        }
        // 3. Final fallback: always return products to recommend.
        if (products.isEmpty()) {
            products = productRepository.findRecommended(PageRequest.of(0, 10));
        }

        // Apply in-memory filters for gender and frameShape
        return products.stream()
                .filter(p -> gender == null || p.getGender().name().equalsIgnoreCase(gender))
                .filter(p -> frameShape == null || frameShape.equalsIgnoreCase(p.getFrameShape()))
                .filter(p -> minPrice == null || (p.getSalePrice() != null
                        ? p.getSalePrice().doubleValue() >= minPrice.doubleValue()
                        : p.getBasePrice().doubleValue() >= minPrice.doubleValue()))
                .filter(p -> maxPrice == null || (p.getSalePrice() != null
                        ? p.getSalePrice().doubleValue() <= maxPrice.doubleValue()
                        : p.getBasePrice().doubleValue() <= maxPrice.doubleValue()))
                .limit(5)
                .map(this::toProductCardDto)
                .toList();
    }

    private ProductCardDto toProductCardDto(Product p) {
        String imageUrl = (p.getVariants() != null && !p.getVariants().isEmpty())
                ? p.getVariants().get(0).getImageUrl()
                : null;
        return new ProductCardDto(
                p.getId(),
                p.getName(),
                p.getSlug(),
                imageUrl,
                p.getBasePrice(),
                p.getSalePrice(),
                p.getBrand() != null ? p.getBrand().getName() : null,
                p.getFrameShape(),
                p.getGender() != null ? p.getGender().name() : null
        );
    }

    private OrderStatusDto executeLookupOrder(Map<String, Object> args, String userId) {
        String orderCode = (String) args.get("orderCode");
        if (orderCode == null || orderCode.isBlank()) return null;

        return orderRepository.findByCode(orderCode.trim().toUpperCase())
                .filter(o -> userId.equals(o.getUserId()))
                .map(o -> new OrderStatusDto(
                        o.getId(),
                        o.getCode(),
                        o.getStatus().name(),
                        o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null,
                        o.getFinalAmount(),
                        o.getCreatedAt()
                ))
                .orElse(null);
    }

    private Map<String, Object> executeListMyOrders(Map<String, Object> args, String userId) {
        String statusArg = (String) args.get("status");
        com.e_commerce.glasses_store.modules.order.entity.Order.OrderStatus statusEnum = null;
        if (statusArg != null && !statusArg.isBlank()) {
            try {
                statusEnum = com.e_commerce.glasses_store.modules.order.entity.Order.OrderStatus
                        .valueOf(statusArg.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown order status from model: {}", statusArg);
            }
        }

        var pageable = PageRequest.of(0, 20);
        List<com.e_commerce.glasses_store.modules.order.entity.Order> orders;
        long totalCount;
        if (statusEnum != null) {
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, statusEnum, pageable);
            totalCount = orderRepository.countByUserIdAndStatus(userId, statusEnum);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            totalCount = orderRepository.countByUserId(userId);
        }

        List<OrderStatusDto> dtos = orders.stream()
                .map(o -> new OrderStatusDto(
                        o.getId(),
                        o.getCode(),
                        o.getStatus() != null ? o.getStatus().name() : null,
                        o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null,
                        o.getFinalAmount(),
                        o.getCreatedAt()
                ))
                .toList();

        Map<String, Object> payload = new HashMap<>();
        payload.put("statusFilter", statusEnum != null ? statusEnum.name() : null);
        payload.put("totalCount", totalCount);
        payload.put("returnedCount", dtos.size());
        payload.put("orders", dtos);
        return payload;
    }

    // ==================== Serialization Helpers ====================

    private String serializeProductResults(List<ProductCardDto> products) {
        if (products == null || products.isEmpty()) {
            return "No products found matching the criteria.";
        }
        try {
            return MAPPER.writeValueAsString(products);
        } catch (Exception e) {
            return "Found " + products.size() + " products.";
        }
    }

    private String serializeOrderResult(OrderStatusDto order) {
        if (order == null) {
            return "Order not found or does not belong to this account.";
        }
        try {
            return MAPPER.writeValueAsString(order);
        } catch (Exception e) {
            return "Order status: " + order.status();
        }
    }

    private String serializeOrderListPayload(Map<String, Object> payload) {
        try {
            return MAPPER.writeValueAsString(payload);
        } catch (Exception e) {
            Object total = payload.get("totalCount");
            return "Found " + total + " orders.";
        }
    }

    // ==================== DB Persistence ====================

    private void persistMessages(ChatSession session, String userText, String assistantText) {
        try {
            messageRepository.save(ChatMessage.builder()
                    .session(session)
                    .role(ChatMessage.MessageRole.USER)
                    .content(userText)
                    .build());
            messageRepository.save(ChatMessage.builder()
                    .session(session)
                    .role(ChatMessage.MessageRole.ASSISTANT)
                    .content(assistantText)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to persist chat messages: {}", e.getMessage());
        }
    }
}
