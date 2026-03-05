package com.e_commerce.glasses_store.modules.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when password confirmation does not match.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PasswordMismatchException extends RuntimeException {

    public PasswordMismatchException() {
        super("Password confirmation does not match");
    }

    public PasswordMismatchException(String message) {
        super(message);
    }
}
