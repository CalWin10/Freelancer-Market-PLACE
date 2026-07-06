package com.freelancer.controller;

import com.freelancer.dto.request.UpdateFreelancerProfileRequest;
import com.freelancer.dto.response.FreelancerProfileResponse;
import com.freelancer.service.FreelancerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/freelancer")
@RequiredArgsConstructor
public class FreelancerProfileController {

    private final FreelancerProfileService freelancerProfileService;

    @GetMapping("/me")
    public ResponseEntity<FreelancerProfileResponse> getMyProfile(Authentication authentication) {

        return ResponseEntity.ok(
                freelancerProfileService.getMyProfile(authentication.getName())
        );
    }

    @PutMapping("/me")
    public ResponseEntity<FreelancerProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateFreelancerProfileRequest request) {

        return ResponseEntity.ok(
                freelancerProfileService.updateMyProfile(authentication.getName(), request)
        );
    }
}