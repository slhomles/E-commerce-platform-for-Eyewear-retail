package com.e_commerce.glasses_store.modules.admin.dto.response;

import com.e_commerce.glasses_store.modules.auth.entity.Role;
import java.time.LocalDateTime;

/**
 * Detailed user information for admin view.
 */
public record UserResponse(
        String id,
        String email,
        String fullName,
        String phone,
        String avatar,
        Role role,
        boolean emailVerified,
        boolean enabled,
        LocalDateTime createdAt
) {}
