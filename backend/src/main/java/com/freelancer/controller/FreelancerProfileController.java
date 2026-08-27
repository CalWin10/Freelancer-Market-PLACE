package com.freelancer.controller;

import com.freelancer.dto.request.UpdateFreelancerProfileRequest;
import com.freelancer.dto.response.FreelancerProfileResponse;
import com.freelancer.service.FreelancerProfileService;
import com.freelancer.service.FreelancerSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerProfileController {

    private final FreelancerProfileService freelancerProfileService;
    private final FreelancerSearchService freelancerSearchService;

    @GetMapping("/search")
    public ResponseEntity<Page<FreelancerProfileResponse>> search(
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minRate,
            @RequestParam(required = false) Double maxRate,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(
                freelancerSearchService.search(skills, location, minRate, maxRate, page, size, sortBy));
    }

    @GetMapping("/me")
    public ResponseEntity<FreelancerProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(
                freelancerProfileService.getMyProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<FreelancerProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateFreelancerProfileRequest request) {
        return ResponseEntity.ok(
                freelancerProfileService.updateMyProfile(authentication.getName(), request));
    }
}
