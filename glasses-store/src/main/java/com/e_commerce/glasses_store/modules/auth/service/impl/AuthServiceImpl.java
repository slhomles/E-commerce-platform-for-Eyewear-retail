package com.e_commerce.glasses_store.modules.auth.service.impl;

import com.e_commerce.glasses_store.modules.auth.dto.request.*;
import com.e_commerce.glasses_store.modules.auth.dto.response.TokenResponse;
import com.e_commerce.glasses_store.modules.auth.entity.*;
import com.e_commerce.glasses_store.modules.auth.exception.*;
import com.e_commerce.glasses_store.modules.auth.repository.*;
import com.e_commerce.glasses_store.modules.auth.service.AuthService;
import com.e_commerce.glasses_store.modules.auth.service.EmailService;
import com.e_commerce.glasses_store.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of AuthService providing all authentication operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    // Token validity durations
    private static final long EMAIL_VERIFICATION_TOKEN_VALIDITY_HOURS = 24;
    private static final long PASSWORD_RESET_TOKEN_VALIDITY_HOURS = 1;

    @Override
    public void register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.USER)
                .emailVerified(true)
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Send verification email
        // sendEmailVerificationToken(user);
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        // Check if account is enabled
        if (!user.isEnabled()) {
            throw new AuthException("Account is disabled");
        }

        // Optional: Check if email is verified (uncomment if required)
        // if (!user.isEmailVerified()) {
        // throw new UserNotVerifiedException();
        // }

        // Generate tokens
        return generateTokenResponse(user);
    }

    @Override
    public TokenResponse refresh(RefreshTokenRequest request) {
        // Find refresh token
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new TokenExpiredException("Invalid refresh token"));

        // Check if expired
        if (refreshToken.isExpired()) {
            refreshTokenRepository.revokeByToken(request.getRefreshToken());
            throw new TokenExpiredException("Refresh token has expired");
        }

        // Revoke old token (token rotation)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        // Generate new tokens
        return generateTokenResponse(refreshToken.getUser());
    }

    @Override
    public void logout(LogoutRequest request) {
        refreshTokenRepository.revokeByToken(request.getRefreshToken());
        log.info("User logged out, refresh token revoked");
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Delete old password reset tokens
            verificationTokenRepository.deleteByUserAndTokenType(user, TokenType.PASSWORD_RESET);

            // Create new token
            String token = UUID.randomUUID().toString();
            VerificationToken verificationToken = VerificationToken.builder()
                    .token(token)
                    .user(user)
                    .tokenType(TokenType.PASSWORD_RESET)
                    .expiryDate(Instant.now().plusSeconds(PASSWORD_RESET_TOKEN_VALIDITY_HOURS * 3600))
                    .build();

            verificationTokenRepository.save(verificationToken);

            // Send email
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token);
                log.info("Password reset email sent to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send password reset email to: {}. Error: {}", user.getEmail(), e.getMessage());
                // Silently catch to not reveal if the email exists, and to prevent 500 errors
            }
        });

        // Always return success (security: don't reveal if email exists)
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        VerificationToken verificationToken = verificationTokenRepository
                .findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new TokenExpiredException("Invalid or expired reset token"));

        // Check type
        if (verificationToken.getTokenType() != TokenType.PASSWORD_RESET) {
            throw new TokenExpiredException("Invalid token type");
        }

        // Check expiry
        if (verificationToken.isExpired()) {
            throw new TokenExpiredException("Reset token has expired");
        }

        // Update password
        User user = verificationToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUser(user);

        log.info("Password reset successful for: {}", user.getEmail());
    }

    @Override
    public void changePassword(User user, ChangePasswordRequest request) {
        // Validate old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException();
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUser(user);

        log.info("Password changed for: {}", user.getEmail());
    }

    @Override
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository
                .findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new TokenExpiredException("Invalid or expired verification token"));

        // Check type
        if (verificationToken.getTokenType() != TokenType.EMAIL_VERIFICATION) {
            throw new TokenExpiredException("Invalid token type");
        }

        // Check expiry
        if (verificationToken.isExpired()) {
            throw new TokenExpiredException("Verification token has expired");
        }

        // Verify email
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Mark token as used
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        log.info("Email verified for: {}", user.getEmail());
    }

    @Override
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("email", request.getEmail()));

        if (user.isEmailVerified()) {
            throw new AuthException("Email is already verified");
        }

        // Delete old verification tokens
        verificationTokenRepository.deleteByUserAndTokenType(user, TokenType.EMAIL_VERIFICATION);

        // Send new verification email
        sendEmailVerificationToken(user);
    }

    // ==================== Private Helper Methods ====================

    private TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationSeconds())
                .userId(user.getId() != null ? user.getId().toString() : "")
                .role(user.getRole().name())
                .build();
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMillis()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private void sendEmailVerificationToken(User user) {
        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .tokenType(TokenType.EMAIL_VERIFICATION)
                .expiryDate(Instant.now().plusSeconds(EMAIL_VERIFICATION_TOKEN_VALIDITY_HOURS * 3600))
                .build();

        verificationTokenRepository.save(verificationToken);

        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}. Error: {}", user.getEmail(), e.getMessage());
            // We intentionally catch this exception so the registration process
            // still succeeds even if the email service is temporarily down or
            // misconfigured.
        }
    }
}
