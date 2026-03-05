package com.e_commerce.glasses_store.modules.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a token is expired or invalid.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class TokenExpiredException extends AuthException {

    public TokenExpiredException() {
        super("Token has expired or is invalid");
    }

    public TokenExpiredException(String message) {
        super(message);
    }
}
