package com.e_commerce.glasses_store.modules.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when user has not verified their email.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UserNotVerifiedException extends AuthException {

    public UserNotVerifiedException() {
        super("Email not verified. Please verify your email to continue.");
    }

    public UserNotVerifiedException(String message) {
        super(message);
    }
}
