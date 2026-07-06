package com.freelancer.service;

import com.freelancer.dto.request.UpdateFreelancerProfileRequest;
import com.freelancer.dto.response.FreelancerProfileResponse;
import com.freelancer.entity.FreelancerProfile;
import com.freelancer.entity.User;
import com.freelancer.repository.FreelancerProfileRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FreelancerProfileService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final UserRepository userRepository;

    public FreelancerProfileResponse getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return FreelancerProfileResponse.builder()
                .id(profile.getId())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .hourlyRate(profile.getHourlyRate())
                .skills(profile.getSkills())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .build();
    }

    public FreelancerProfileResponse updateMyProfile(
            String email,
            UpdateFreelancerProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
                .orElseGet(() -> FreelancerProfile.builder()
                        .user(user)
                        .build());

        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setSkills(request.getSkills());
        profile.setProfilePhotoUrl(request.getProfilePhotoUrl());

        freelancerProfileRepository.save(profile);

        return FreelancerProfileResponse.builder()
                .id(profile.getId())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .hourlyRate(profile.getHourlyRate())
                .skills(profile.getSkills())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .build();
    }
}