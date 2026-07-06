package com.freelancer.controller;

import com.freelancer.dto.request.UpdateClientProfileRequest;
import com.freelancer.dto.response.ClientProfileResponse;
import com.freelancer.service.ClientProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/client")
@RequiredArgsConstructor
public class ClientProfileController {

    private final ClientProfileService clientProfileService;

    @GetMapping("/me")
    public ResponseEntity<ClientProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(
                clientProfileService.getMyProfile(authentication.getName())
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ClientProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateClientProfileRequest request) {

        return ResponseEntity.ok(
                clientProfileService.updateMyProfile(authentication.getName(), request)
        );
    }
}