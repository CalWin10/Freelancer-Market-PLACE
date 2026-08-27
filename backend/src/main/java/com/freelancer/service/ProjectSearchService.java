package com.freelancer.service;

import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProjectSearchService {

    private final ProjectRepository projectRepository;

    public Page<ProjectResponse> search(
            String q,
            String skills,
            String status,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            int page,
            int size,
            String sortBy) {

        Sort sort = switch (sortBy) {
            case "budgetAsc"  -> Sort.by("budget").ascending();
            case "budgetDesc" -> Sort.by("budget").descending();
            default           -> Sort.by("createdAt").descending(); // newest first
        };

        ProjectStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = ProjectStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        return projectRepository
                .search(
                        blankToNull(q),
                        blankToNull(skills),
                        statusEnum,
                        ProjectStatus.DRAFT,
                        minBudget,
                        maxBudget,
                        PageRequest.of(page, size, sort))
                .map(this::toResponse);
    }

    private ProjectResponse toResponse(com.freelancer.entity.Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .budget(p.getBudget())
                .requiredSkills(p.getRequiredSkills())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
