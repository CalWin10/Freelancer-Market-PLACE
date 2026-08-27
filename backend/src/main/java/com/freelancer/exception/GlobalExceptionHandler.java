package com.freelancer.exception;

import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
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

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(
            AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", 401,
                "message", "Invalid email or password"
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableRequest(
            HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "Invalid request body"
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataConflict(
            DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409,
                "message", "Request conflicts with existing data"
        ));
    }

    @ExceptionHandler(ConcurrencyFailureException.class)
    public ResponseEntity<Map<String, Object>> handleConcurrencyConflict(
            ConcurrencyFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409,
                "message", "The record changed while this request was running. Please retry."
        ));
    }

    // Known client-facing errors mapped to their correct HTTP status
    private static final Map<String, HttpStatus> CLIENT_ERRORS = Map.ofEntries(
            Map.entry("User not found",                             HttpStatus.NOT_FOUND),
            Map.entry("Profile not found",                          HttpStatus.NOT_FOUND),
            Map.entry("Project not found",                          HttpStatus.NOT_FOUND),
            Map.entry("Application not found",                      HttpStatus.NOT_FOUND),
            Map.entry("Access Denied",                              HttpStatus.FORBIDDEN),
            Map.entry("Invalid email or password",                  HttpStatus.UNAUTHORIZED),
            Map.entry("Role must be CLIENT or FREELANCER",          HttpStatus.BAD_REQUEST),
            Map.entry("Email already registered.",                  HttpStatus.CONFLICT),
            Map.entry("Already applied to this project",            HttpStatus.CONFLICT),
            Map.entry("Application has already been processed",     HttpStatus.CONFLICT),
            Map.entry("Invalid or expired reset token",             HttpStatus.BAD_REQUEST),
            Map.entry("Project is not open for applications",       HttpStatus.UNPROCESSABLE_ENTITY),
            Map.entry("Only OPEN or DRAFT projects can be edited",  HttpStatus.UNPROCESSABLE_ENTITY),
            Map.entry("Only OPEN or DRAFT projects can be deleted", HttpStatus.UNPROCESSABLE_ENTITY)
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Internal server error";
        // Prefix-based 400 for state machine violations
        if (msg.startsWith("Invalid transition:")) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", msg));
        }
        HttpStatus status = CLIENT_ERRORS.getOrDefault(msg, HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "message", msg
        ));
    }
}
