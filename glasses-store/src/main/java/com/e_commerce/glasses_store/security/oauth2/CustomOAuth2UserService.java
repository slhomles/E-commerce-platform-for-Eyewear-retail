package com.e_commerce.glasses_store.security.oauth2;

import com.e_commerce.glasses_store.modules.auth.entity.AuthProvider;
import com.e_commerce.glasses_store.modules.auth.entity.Role;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * Custom OAuth2 user service that loads or creates a User in the local database
 * after successful OAuth2 authentication from Google, Facebook, or GitHub.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId = extractProviderId(attributes, registrationId);
        String email = extractEmail(attributes, registrationId);
        String name = extractName(attributes, registrationId);
        String avatar = extractAvatar(attributes, registrationId);

        log.debug("OAuth2 login - provider: {}, email: {}, name: {}", registrationId, email, name);

        // Find existing user by email
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update provider info if needed
            user.setProvider(provider);
            user.setProviderId(providerId);
            if (avatar != null && user.getAvatar() == null) {
                user.setAvatar(avatar);
            }
            userRepository.save(user);
        } else {
            // Create new user
            user = User.builder()
                    .email(email)
                    .fullName(name != null ? name : email.split("@")[0])
                    .avatar(avatar)
                    .provider(provider)
                    .providerId(providerId)
                    .role(Role.USER)
                    .emailVerified(true) // OAuth2 users are considered verified
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }

    private String extractProviderId(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("sub");
            case "facebook" -> (String) attributes.get("id");
            case "github" -> String.valueOf(attributes.get("id"));
            default -> null;
        };
    }

    private String extractEmail(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("email");
            case "facebook" -> {
                String email = (String) attributes.get("email");
                if (email == null) {
                    email = attributes.get("id") + "@facebook.com";
                }
                yield email;
            }
            case "github" -> {
                String email = (String) attributes.get("email");
                // GitHub email might be null if user has private email
                if (email == null) {
                    email = attributes.get("login") + "@github.com";
                }
                yield email;
            }
            default -> null;
        };
    }

    private String extractName(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("name");
            case "facebook" -> (String) attributes.get("name");
            case "github" -> {
                String name = (String) attributes.get("name");
                yield name != null ? name : (String) attributes.get("login");
            }
            default -> null;
        };
    }

    private String extractAvatar(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("picture");
            case "facebook" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> picture = (Map<String, Object>) attributes.get("picture");
                if (picture != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) picture.get("data");
                    yield data != null ? (String) data.get("url") : null;
                }
                yield null;
            }
            case "github" -> (String) attributes.get("avatar_url");
            default -> null;
        };
    }
}
