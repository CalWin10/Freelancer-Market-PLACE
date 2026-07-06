package com.freelancer.service;

import com.freelancer.dto.request.UpdateClientProfileRequest;
import com.freelancer.dto.response.ClientProfileResponse;
import com.freelancer.entity.ClientProfile;
import com.freelancer.entity.User;
import com.freelancer.repository.ClientProfileRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientProfileService {

    private final ClientProfileRepository clientProfileRepository;
    private final UserRepository userRepository;

    public ClientProfileResponse getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        ClientProfileResponse response = new ClientProfileResponse();
        response.setCompanyName(profile.getCompanyName());
        response.setContactName(profile.getContactName());
        response.setBio(profile.getBio());
        response.setProfilePhotoUrl(profile.getProfilePhotoUrl());

        return response;
    }

    public ClientProfileResponse updateMyProfile(String email,
                                                 UpdateClientProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setCompanyName(request.getCompanyName());
        profile.setContactName(request.getContactName());
        profile.setBio(request.getBio());
        profile.setProfilePhotoUrl(request.getProfilePhotoUrl());

        clientProfileRepository.save(profile);

        ClientProfileResponse response = new ClientProfileResponse();
        response.setCompanyName(profile.getCompanyName());
        response.setContactName(profile.getContactName());
        response.setBio(profile.getBio());
        response.setProfilePhotoUrl(profile.getProfilePhotoUrl());

        return response;
    }
}