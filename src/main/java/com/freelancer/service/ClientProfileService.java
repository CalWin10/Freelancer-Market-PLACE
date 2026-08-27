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
        User user = getUser(email);
        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));
        return toResponse(profile, user);
    }

    public ClientProfileResponse updateMyProfile(String email,
                                                 UpdateClientProfileRequest request) {
        User user = getUser(email);
        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));

        profile.setCompanyName(request.getCompanyName());
        profile.setContactName(request.getContactName());
        profile.setBio(request.getBio());

        clientProfileRepository.save(profile);
        return toResponse(profile, user);
    }

    public void updatePhotoUrl(String email, String photoUrl) {
        User user = getUser(email);
        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));
        profile.setProfilePhotoUrl(photoUrl);
        clientProfileRepository.save(profile);
    }

    public void removePhoto(String email) {
        updatePhotoUrl(email, null);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ClientProfile createEmptyProfile(User user) {
        return clientProfileRepository.save(ClientProfile.builder().user(user).build());
    }

    private ClientProfileResponse toResponse(ClientProfile p, User user) {
        return ClientProfileResponse.builder()
                .id(p.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .companyName(p.getCompanyName())
                .contactName(p.getContactName())
                .bio(p.getBio())
                .profilePhotoUrl(p.getProfilePhotoUrl())
                .build();
    }
}
