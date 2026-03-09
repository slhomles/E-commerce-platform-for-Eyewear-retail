package com.e_commerce.glasses_store.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for authentication tokens.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {

    private String accessToken;
    private String refreshToken;

    private String tokenType = "Bearer";

    private long expiresIn;

    private String userId;
    private String role;
}
