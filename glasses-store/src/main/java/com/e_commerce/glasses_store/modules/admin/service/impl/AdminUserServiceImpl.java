package com.e_commerce.glasses_store.modules.admin.service.impl;

import com.e_commerce.glasses_store.modules.admin.dto.request.UpdateUserRequest;
import com.e_commerce.glasses_store.modules.admin.dto.response.UserResponse;
import com.e_commerce.glasses_store.modules.admin.service.AdminUserService;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toResponse(user);
    }

    @Override
    public UserResponse updateUser(String id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setFullName(req.fullName());
        user.setPhone(req.phone());
        user.setRole(req.role());
        user.setEnabled(req.enabled());

        user = userRepository.save(user);
        log.info("Admin updated user: {} ({})", user.getEmail(), id);
        return toResponse(user);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPhone(),
                u.getAvatar(),
                u.getRole(),
                u.isEmailVerified(),
                u.isEnabled(),
                u.getCreatedAt()
        );
    }
}
