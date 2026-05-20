package com.e_commerce.glasses_store.modules.review.validation;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class ReviewContentPolicy {

    private static final String LINK_ERROR_MESSAGE =
            "Review content cannot contain links, URLs, or contact addresses.";

    private static final String HIDDEN_CONTENT_MESSAGE =
            "Noi dung danh gia da bi an vi chua lien ket khong an toan.";

    private static final Pattern URL_SCHEME_PATTERN = Pattern.compile(
            "(?:https?|ftp|file)\\s*://|(?:javascript|data|mailto)\\s*:",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern WWW_PATTERN = Pattern.compile(
            "(^|[^a-z0-9_-])www\\s*(?:\\.|\\[\\.\\]|\\(\\.\\)|\\{\\.\\})",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "(^|[^a-z0-9._%+-])[a-z0-9._%+-]+\\s*@\\s*[a-z0-9.-]+\\.[a-z]{2,24}($|[^a-z0-9_-])",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern DOMAIN_PATTERN = Pattern.compile(
            "(^|[^a-z0-9_-])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\s*"
                    + "(?:\\.|\\[\\.\\]|\\(\\.\\)|\\{\\.\\}|\\s+dot\\s+|\\s+cham\\s+|\\s+chấm\\s+)\\s*)+"
                    + "[a-z]{2,24}($|[^a-z0-9_-])",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    private static final Pattern ZERO_WIDTH_CHARS = Pattern.compile("[\\u200B-\\u200D\\uFEFF]");

    private ReviewContentPolicy() {
    }

    public static void validate(String content) {
        if (containsBlockedLink(content)) {
            throw new IllegalArgumentException(LINK_ERROR_MESSAGE);
        }
    }

    public static boolean containsBlockedLink(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }

        String normalized = normalize(content);
        return URL_SCHEME_PATTERN.matcher(normalized).find()
                || WWW_PATTERN.matcher(normalized).find()
                || EMAIL_PATTERN.matcher(normalized).find()
                || DOMAIN_PATTERN.matcher(normalized).find();
    }

    public static String sanitizeForDisplay(String content) {
        return containsBlockedLink(content) ? HIDDEN_CONTENT_MESSAGE : content;
    }

    private static String normalize(String content) {
        String withoutZeroWidthChars = ZERO_WIDTH_CHARS.matcher(content).replaceAll("");
        return Normalizer.normalize(withoutZeroWidthChars, Normalizer.Form.NFKC);
    }
}
