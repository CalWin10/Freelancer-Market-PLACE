package com.freelancer.controller;

import com.freelancer.dto.request.ApplyRequest;
import com.freelancer.dto.response.ApplicationResponse;
import com.freelancer.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // POST /api/v1/projects/{id}/apply
    @PostMapping("/api/v1/projects/{id}/apply")
    public ResponseEntity<ApplicationResponse> apply(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ApplyRequest request) {
        return ResponseEntity.ok(
                applicationService.apply(authentication.getName(), id, request));
    }

    // GET /api/v1/projects/{id}/applications
    @GetMapping("/api/v1/projects/{id}/applications")
    public ResponseEntity<List<ApplicationResponse>> getApplications(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                applicationService.getApplications(authentication.getName(), id));
    }

    // PUT /api/v1/applications/{id}/accept
    @PutMapping("/api/v1/applications/{id}/accept")
    public ResponseEntity<ApplicationResponse> accept(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                applicationService.accept(authentication.getName(), id));
    }

    // PUT /api/v1/applications/{id}/reject
    @PutMapping("/api/v1/applications/{id}/reject")
    public ResponseEntity<ApplicationResponse> reject(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                applicationService.reject(authentication.getName(), id));
    }
}
