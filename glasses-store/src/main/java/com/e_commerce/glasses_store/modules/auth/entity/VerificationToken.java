package com.e_commerce.glasses_store.modules.auth.entity;

import com.e_commerce.glasses_store.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity for storing verification tokens (email verification, password reset).
 */
@Entity
@Table(name = "verification_tokens", indexes = {
        @Index(name = "idx_verification_tokens_token", columnList = "token", unique = true),
        @Index(name = "idx_verification_tokens_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false)
    private TokenType tokenType;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    /**
     * Check if token is expired.
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }

    /**
     * Check if token is valid (not used and not expired).
     */
    public boolean isValid() {
        return !used && !isExpired();
    }
}
