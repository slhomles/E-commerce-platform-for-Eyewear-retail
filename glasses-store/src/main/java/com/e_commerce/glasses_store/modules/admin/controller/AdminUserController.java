package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.dto.request.UpdateUserRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.UserResponse;
import com.e_commerce.glasses_store.modules.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin API for user management.
 * Access restricted to users with ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getAllUsers(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getUserById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.updateUser(id, request)));
    }
}
