package com.freelancer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.put(e.getField(), e.getDefaultMessage()));

        return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "Validation failed",
                "errors", fieldErrors
        ));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(
            MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "message", "File size exceeds the maximum allowed limit"
        ));
    }

    // Known client-facing errors mapped to their correct HTTP status
    private static final Map<String, HttpStatus> CLIENT_ERRORS = Map.of(
            "User not found",                              HttpStatus.NOT_FOUND,
            "Profile not found",                           HttpStatus.NOT_FOUND,
            "Project not found",                           HttpStatus.NOT_FOUND,
            "Access Denied",                               HttpStatus.FORBIDDEN,
            "Email already registered.",                   HttpStatus.CONFLICT,
            "Invalid or expired reset token",              HttpStatus.BAD_REQUEST,
            "Only OPEN or DRAFT projects can be edited",   HttpStatus.UNPROCESSABLE_ENTITY,
            "Only OPEN or DRAFT projects can be deleted",  HttpStatus.UNPROCESSABLE_ENTITY
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        HttpStatus status = ex.getMessage() != null
                ? CLIENT_ERRORS.getOrDefault(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR)
                : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "message", ex.getMessage() != null ? ex.getMessage() : "Internal server error"
        ));
    }
}
