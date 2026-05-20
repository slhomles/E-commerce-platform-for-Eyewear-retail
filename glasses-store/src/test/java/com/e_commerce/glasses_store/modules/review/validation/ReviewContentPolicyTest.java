package com.e_commerce.glasses_store.modules.review.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReviewContentPolicyTest {

    @Test
    void containsBlockedLinkDetectsDirectUrls() {
        assertTrue(ReviewContentPolicy.containsBlockedLink("Check https://bad.example"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Visit http://bad.example/path"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Run javascript:alert(1)"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Open www.example.com"));
        assertTrue(ReviewContentPolicy.containsBlockedLink(
                "Moi nguoi vao link nay https://aistudio.google.com/api-keys?project=gen-lang-client-0857804304"));
    }

    @Test
    void containsBlockedLinkDetectsBareAndObfuscatedDomains() {
        assertTrue(ReviewContentPolicy.containsBlockedLink("Go to example.com now"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Go to example[.]com now"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Go to example dot com now"));
        assertTrue(ReviewContentPolicy.containsBlockedLink("Go to example cham com now"));
    }

    @Test
    void containsBlockedLinkAllowsNormalReviewText() {
        assertFalse(ReviewContentPolicy.containsBlockedLink("Kinh rat dep, giao hang nhanh."));
        assertFalse(ReviewContentPolicy.containsBlockedLink("Size 54 mm, chat luong 5.0 sao."));
        assertFalse(ReviewContentPolicy.containsBlockedLink(""));
        assertFalse(ReviewContentPolicy.containsBlockedLink(null));
    }

    @Test
    void validateRejectsBlockedContent() {
        assertThrows(
                IllegalArgumentException.class,
                () -> ReviewContentPolicy.validate("Nhan qua tai phishing.example"));
    }

    @Test
    void sanitizeForDisplayHidesExistingBlockedContent() {
        String sanitized = ReviewContentPolicy.sanitizeForDisplay(
                "Moi nguoi vao link nay https://aistudio.google.com/api-keys?project=gen-lang-client-0857804304");

        assertFalse(sanitized.contains("https://"));
        assertTrue(sanitized.contains("lien ket khong an toan"));
    }
}
