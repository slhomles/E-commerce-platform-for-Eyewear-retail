package com.e_commerce.glasses_store.modules.auth.service;

import com.e_commerce.glasses_store.modules.auth.dto.request.*;
import com.e_commerce.glasses_store.modules.auth.dto.response.TokenResponse;
import com.e_commerce.glasses_store.modules.auth.entity.User;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Register a new user.
     */
    void register(RegisterRequest request);

    /**
     * Authenticate user and return tokens.
     */
    TokenResponse login(LoginRequest request);

    /**
     * Refresh access token using refresh token.
     */
    TokenResponse refresh(RefreshTokenRequest request);

    /**
     * Logout user and revoke refresh token.
     */
    void logout(LogoutRequest request);

    /**
     * Request password reset (sends email with token).
     */
    void forgotPassword(ForgotPasswordRequest request);

    /**
     * Reset password using token.
     */
    void resetPassword(ResetPasswordRequest request);

    /**
     * Change password for authenticated user.
     */
    void changePassword(User user, ChangePasswordRequest request);

    /**
     * Verify email with token.
     */
    void verifyEmail(String token);

    /**
     * Resend verification email.
     */
    void resendVerification(ResendVerificationRequest request);
}
