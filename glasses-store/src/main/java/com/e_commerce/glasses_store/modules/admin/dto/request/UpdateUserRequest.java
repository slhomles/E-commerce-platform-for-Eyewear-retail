package com.e_commerce.glasses_store.modules.admin.dto.request;

import com.e_commerce.glasses_store.modules.auth.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request to update user information by admin.
 */
public record UpdateUserRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        String phone,

        @NotNull(message = "Role is required")
        Role role,

        boolean enabled
) {}
