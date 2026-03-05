package com.e_commerce.glasses_store.modules.auth.service;

/**
 * Service interface for sending emails.
 * Implement this with your email provider (SMTP, SendGrid, etc.)
 */
public interface EmailService {

    /**
     * Send email verification link.
     */
    void sendVerificationEmail(String to, String token);

    /**
     * Send password reset link.
     */
    void sendPasswordResetEmail(String to, String token);
}
