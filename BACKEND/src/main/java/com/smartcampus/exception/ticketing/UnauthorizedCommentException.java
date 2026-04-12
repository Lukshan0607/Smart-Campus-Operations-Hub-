package com.smartcampus.exception.ticketing;

public class UnauthorizedCommentException extends RuntimeException {
    public UnauthorizedCommentException(String message) {
        super(message);
    }

    public UnauthorizedCommentException(String message, Throwable cause) {
        super(message, cause);
    }
}
