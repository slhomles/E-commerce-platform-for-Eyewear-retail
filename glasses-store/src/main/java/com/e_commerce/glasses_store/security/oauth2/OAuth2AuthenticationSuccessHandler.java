package com.e_commerce.glasses_store.security.oauth2;

import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Handles successful OAuth2 authentication by generating JWT tokens
 * and redirecting the user back to the frontend with the tokens.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${app.oauth2.authorized-redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.debug("OAuth2 login success for user: {}, generating JWT tokens", user.getEmail());

        // Build redirect URL with tokens as query parameters
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("userId", user.getId())
                .queryParam("role", user.getRole().name())
                .queryParam("fullName", user.getFullName())
                .queryParam("email", user.getEmail())
                .queryParam("provider", user.getProvider().name())
                .build()
                .encode()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
