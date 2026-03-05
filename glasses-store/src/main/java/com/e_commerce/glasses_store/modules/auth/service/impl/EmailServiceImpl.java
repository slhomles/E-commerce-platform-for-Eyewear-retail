package com.e_commerce.glasses_store.modules.auth.service.impl;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import com.e_commerce.glasses_store.modules.auth.service.EmailService;

/**
 * Implementation of EmailService using JavaMailSender.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String to, String token) {
        log.info("📧 Sending actual verification email to: {} with token: {}", to, token);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Verify Your Email Address - Glasses Store");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                    + "<h2>Welcome to Glasses Store!</h2>"
                    + "<p>Thank you for registering. Please use the following token to verify your email address:</p>"
                    + "<h3 style=\"background-color: #f4f4f4; padding: 10px; display: inline-block;\">" + token
                    + "</h3>"
                    + "<p>Or click this link: <a href=\"http://localhost:8080/api/v1/auth/verify-email?token=" + token
                    + "\">Verify Email</a></p>"
                    + "<p>This token will expire in 24 hours.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("✅ Verification email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("❌ Failed to send verification email to {}", to, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        log.info("📧 Sending actual password reset email to: {} with token: {}", to, token);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Reset Your Password - Glasses Store");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                    + "<h2>Password Reset Request</h2>"
                    + "<p>We received a request to reset your password. Here is your reset token:</p>"
                    + "<h3 style=\"background-color: #f4f4f4; padding: 10px; display: inline-block;\">" + token
                    + "</h3>"
                    + "<p>If you didn't request this, please ignore this email.</p>"
                    + "<p>This token will expire in 1 hour.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("✅ Password reset email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("❌ Failed to send password reset email to {}", to, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
