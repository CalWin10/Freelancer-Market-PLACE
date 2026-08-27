package com.freelancer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.dto.request.ApplyRequest;
import com.freelancer.dto.response.ApplicationResponse;
import com.freelancer.entity.Application;
import com.freelancer.entity.FreelancerProfile;
import com.freelancer.entity.Project;
import com.freelancer.entity.ProjectStatusHistory;
import com.freelancer.entity.User;
import com.freelancer.enums.ApplicationStatus;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.repository.ApplicationRepository;
import com.freelancer.repository.FreelancerProfileRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.ProjectStatusHistoryRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ProjectStatusHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    // POST /projects/{id}/apply
    @Transactional
    public ApplicationResponse apply(String email, Long projectId, ApplyRequest request) {
        User freelancer = getUser(email);
        Project project = getProjectForUpdate(projectId);

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Project is not open for applications");
        }
        if (applicationRepository.existsByProjectAndFreelancer(project, freelancer)) {
            throw new RuntimeException("Already applied to this project");
        }

        Application app = Application.builder()
                .project(project)
                .freelancer(freelancer)
                .message(request.getMessage())
                .status(ApplicationStatus.PENDING)
                .build();

        try {
            return toResponse(applicationRepository.saveAndFlush(app));
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Already applied to this project", ex);
        }
    }

    // GET /projects/{id}/applications  (client only)
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplications(String email, Long projectId) {
        User client = getUser(email);
        Project project = getProject(projectId);

        if (!project.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Access Denied");
        }

        return applicationRepository.findByProject(project)
                .stream().map(this::toResponse).toList();
    }

    // PUT /applications/{id}/accept
    @Transactional
    public ApplicationResponse accept(String email, Long applicationId) {
        User client = getUser(email);
        Long projectId = getApplicationProjectId(applicationId);
        Project project = getProjectForUpdate(projectId);
        Application app = getApplicationForUpdate(applicationId);

        if (!project.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Access Denied");
        }
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application has already been processed");
        }
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Project is not open for applications");
        }

        app.setStatus(ApplicationStatus.ACCEPTED);
        project.setStatus(ProjectStatus.ASSIGNED);
        project.setAssignedFreelancer(app.getFreelancer());
        projectRepository.save(project);

        historyRepository.save(ProjectStatusHistory.builder()
                .project(project)
                .fromStatus(ProjectStatus.OPEN)
                .toStatus(ProjectStatus.ASSIGNED)
                .changedByEmail(email)
                .build());

        // Reject all other pending applications for this project
        applicationRepository.findByProject(project).stream()
                .filter(a -> !a.getId().equals(app.getId())
                        && a.getStatus() == ApplicationStatus.PENDING)
                .forEach(a -> {
                    a.setStatus(ApplicationStatus.REJECTED);
                    applicationRepository.save(a);
                });

        return toResponse(applicationRepository.save(app));
    }

    // PUT /applications/{id}/reject
    @Transactional
    public ApplicationResponse reject(String email, Long applicationId) {
        User client = getUser(email);
        Long projectId = getApplicationProjectId(applicationId);
        Project project = getProjectForUpdate(projectId);
        Application app = getApplicationForUpdate(applicationId);

        if (!project.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Access Denied");
        }
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application has already been processed");
        }

        app.setStatus(ApplicationStatus.REJECTED);
        return toResponse(applicationRepository.save(app));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private Project getProjectForUpdate(Long id) {
        return projectRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private Long getApplicationProjectId(Long id) {
        return applicationRepository.findProjectIdById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    private Application getApplicationForUpdate(Long id) {
        return applicationRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    private ApplicationResponse toResponse(Application app) {
        User f = app.getFreelancer();
        FreelancerProfile profile = freelancerProfileRepository.findByUser(f).orElse(null);

        return ApplicationResponse.builder()
                .id(app.getId())
                .projectId(app.getProject().getId())
                .projectTitle(app.getProject().getTitle())
                .freelancerId(f.getId())
                .freelancerName(f.getFullName())
                .freelancerEmail(f.getEmail())
                .freelancerLocation(profile != null ? profile.getLocation() : null)
                .freelancerHourlyRate(profile != null ? profile.getHourlyRate() : null)
                .freelancerSkills(profile != null ? fromJson(profile.getSkills()) : Collections.emptyList())
                .freelancerPhotoUrl(profile != null ? profile.getProfilePhotoUrl() : null)
                .freelancerBio(profile != null ? profile.getBio() : null)
                .message(app.getMessage())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
