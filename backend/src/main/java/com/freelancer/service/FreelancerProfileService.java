package com.freelancer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.dto.PortfolioItemDto;
import com.freelancer.dto.request.UpdateFreelancerProfileRequest;
import com.freelancer.dto.response.FreelancerProfileResponse;
import com.freelancer.entity.FreelancerProfile;
import com.freelancer.entity.PortfolioItem;
import com.freelancer.entity.User;
import com.freelancer.repository.FreelancerProfileRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerProfileService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public FreelancerProfileResponse getMyProfile(String email) {
        User user = getUser(email);
        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));
        return toResponse(profile, user);
    }

    @Transactional
    public FreelancerProfileResponse updateMyProfile(String email,
                                                     UpdateFreelancerProfileRequest request) {
        User user = getUser(email);
        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));

        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setSkills(toJson(request.getSkills()));

        if (request.getPortfolioItems() != null) {
            profile.getPortfolioItems().clear();
            for (PortfolioItemDto dto : request.getPortfolioItems()) {
                PortfolioItem item = new PortfolioItem();
                item.setTitle(dto.getTitle());
                item.setDescription(dto.getDescription());
                item.setProjectUrl(dto.getProjectUrl());
                item.setImageUrl(dto.getImageUrl());
                item.setFreelancerProfile(profile);
                profile.getPortfolioItems().add(item);
            }
        }

        freelancerProfileRepository.save(profile);
        return toResponse(profile, user);
    }

    @Transactional
    public void updatePhotoUrl(String email, String photoUrl) {
        User user = getUser(email);
        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
                .orElseGet(() -> createEmptyProfile(user));
        profile.setProfilePhotoUrl(photoUrl);
        freelancerProfileRepository.save(profile);
    }

    @Transactional
    public void removePhoto(String email) {
        updatePhotoUrl(email, null);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private FreelancerProfile createEmptyProfile(User user) {
        return freelancerProfileRepository.save(FreelancerProfile.builder().user(user).build());
    }

    private FreelancerProfileResponse toResponse(FreelancerProfile p, User user) {
        List<PortfolioItemDto> items = new ArrayList<>();
        if (p.getPortfolioItems() != null) {
            for (PortfolioItem item : p.getPortfolioItems()) {
                PortfolioItemDto dto = new PortfolioItemDto();
                dto.setId(item.getId());
                dto.setTitle(item.getTitle());
                dto.setDescription(item.getDescription());
                dto.setProjectUrl(item.getProjectUrl());
                dto.setImageUrl(item.getImageUrl());
                items.add(dto);
            }
        }
        return FreelancerProfileResponse.builder()
                .id(p.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(p.getBio())
                .location(p.getLocation())
                .hourlyRate(p.getHourlyRate())
                .skills(fromJson(p.getSkills()))
                .profilePhotoUrl(p.getProfilePhotoUrl())
                .portfolioItems(items)
                .build();
    }

    private String toJson(List<String> skills) {
        if (skills == null) return null;
        try {
            return objectMapper.writeValueAsString(skills);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize skills", e);
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse skills", e);
        }
    }
}
