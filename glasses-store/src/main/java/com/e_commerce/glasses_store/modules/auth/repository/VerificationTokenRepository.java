package com.e_commerce.glasses_store.modules.auth.repository;

import com.e_commerce.glasses_store.modules.auth.entity.TokenType;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * Repository for VerificationToken entity operations.
 */
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, String> {

    /**
     * Find token by token string.
     */
    Optional<VerificationToken> findByToken(String token);

    /**
     * Find valid (not used) token by token string.
     */
    Optional<VerificationToken> findByTokenAndUsedFalse(String token);

    /**
     * Find latest token for user by type.
     */
    Optional<VerificationToken> findTopByUserAndTokenTypeOrderByCreatedAtDesc(User user, TokenType tokenType);

    /**
     * Mark token as used.
     */
    @Modifying
    @Query("UPDATE VerificationToken vt SET vt.used = true WHERE vt.token = :token")
    void markAsUsed(String token);

    /**
     * Delete all tokens for a user by type.
     */
    void deleteByUserAndTokenType(User user, TokenType tokenType);

    /**
     * Delete expired tokens (cleanup job).
     */
    @Modifying
    @Query("DELETE FROM VerificationToken vt WHERE vt.expiryDate < :now")
    void deleteExpiredTokens(Instant now);
}
