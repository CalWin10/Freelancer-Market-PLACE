package com.freelancer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.dto.response.FreelancerProfileResponse;
import com.freelancer.entity.FreelancerProfile;
import com.freelancer.repository.FreelancerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerSearchService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ObjectMapper objectMapper;

    public Page<FreelancerProfileResponse> search(
            String skills,
            String location,
            Double minRate,
            Double maxRate,
            int page,
            int size,
            String sortBy) {

        Sort sort = switch (sortBy) {
            case "rateAsc"  -> Sort.by("hourlyRate").ascending();
            case "rateDesc" -> Sort.by("hourlyRate").descending();
            default         -> Sort.by("id").descending(); // newest first
        };

        return freelancerProfileRepository
                .search(
                        blankToNull(skills),
                        blankToNull(location),
                        minRate,
                        maxRate,
                        PageRequest.of(page, size, sort))
                .map(this::toResponse);
    }

    private FreelancerProfileResponse toResponse(FreelancerProfile p) {
        return FreelancerProfileResponse.builder()
                .id(p.getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .bio(p.getBio())
                .location(p.getLocation())
                .hourlyRate(p.getHourlyRate())
                .skills(fromJson(p.getSkills()))
                .profilePhotoUrl(p.getProfilePhotoUrl())
                .portfolioItems(Collections.emptyList())
                .build();
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
