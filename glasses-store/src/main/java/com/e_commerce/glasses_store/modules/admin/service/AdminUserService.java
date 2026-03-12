package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.request.UpdateUserRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for administrative user management operations.
 */
public interface AdminUserService {

    /**
     * Get all users with pagination.
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Get user details by ID.
     */
    UserResponse getUserById(String id);

    /**
     * Update user information and status.
     */
    UserResponse updateUser(String id, UpdateUserRequest request);
}
