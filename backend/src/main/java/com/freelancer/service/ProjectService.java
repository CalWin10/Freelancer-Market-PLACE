package com.freelancer.service;

import com.freelancer.dto.request.CreateProjectRequest;
import com.freelancer.dto.request.ProjectStatusRequest;
import com.freelancer.dto.request.UpdateProjectRequest;
import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.dto.response.StatusHistoryResponse;
import com.freelancer.entity.Project;
import com.freelancer.entity.ProjectStatusHistory;
import com.freelancer.entity.User;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.enums.Role;
import com.freelancer.repository.ApplicationRepository;
import com.freelancer.repository.MessageRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.ProjectStatusHistoryRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectStatusHistoryRepository historyRepository;
    private final ApplicationRepository applicationRepository;
    private final MessageRepository messageRepository;

    // CREATE PROJECT
    @Transactional
    public ProjectResponse createProject(String email, CreateProjectRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .requiredSkills(request.getRequiredSkills())
                .status(ProjectStatus.OPEN)
                .client(user)
                .build();

        return map(projectRepository.save(project));
    }

    // GET SINGLE PROJECT
    @Transactional(readOnly = true)
    public ProjectResponse getProject(String email, Long id) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (project.getStatus() == ProjectStatus.DRAFT
                && !project.getClient().getId().equals(actor.getId())) {
            throw new RuntimeException("Access Denied");
        }
        return mapWithAllowedStatuses(project, actor);
    }

    // GET MY PROJECTS
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getMyProjects(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return projectRepository.findByClient(user, PageRequest.of(page, size))
                .map(this::map);
    }

    // UPDATE PROJECT
    @Transactional
    public ProjectResponse updateProject(String email, Long id, UpdateProjectRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }
        if (project.getStatus() != ProjectStatus.OPEN &&
                project.getStatus() != ProjectStatus.DRAFT) {
            throw new RuntimeException("Only OPEN or DRAFT projects can be edited");
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        project.setRequiredSkills(request.getRequiredSkills());

        return map(projectRepository.save(project));
    }

    // UPDATE STATUS — state machine enforced
    @Transactional
    public ProjectResponse updateStatus(String email, Long id, ProjectStatusRequest request) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectStatus current = project.getStatus();
        ProjectStatus next    = request.getStatus();
        Role actorRole        = actor.getRole();

        // Verify actor is a party to this project
        boolean isClient     = project.getClient().getId().equals(actor.getId());
        boolean isFreelancer = project.getAssignedFreelancer() != null
                && project.getAssignedFreelancer().getId().equals(actor.getId());

        if (!isClient && !isFreelancer) {
            throw new RuntimeException("Access Denied");
        }

        try {
            ProjectStatusMachine.validate(current, next, actorRole);
        } catch (SecurityException e) {
            throw new RuntimeException("Access Denied");
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage());
        }

        project.setStatus(next);
        projectRepository.save(project);

        historyRepository.save(ProjectStatusHistory.builder()
                .project(project)
                .fromStatus(current)
                .toStatus(next)
                .changedByEmail(email)
                .build());

        return mapWithAllowedStatuses(project, actor);
    }

    // DELETE PROJECT
    @Transactional
    public void deleteProject(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }
        if (project.getStatus() != ProjectStatus.OPEN &&
                project.getStatus() != ProjectStatus.DRAFT) {
            throw new RuntimeException("Only OPEN or DRAFT projects can be deleted");
        }

        messageRepository.deleteByProject(project);
        applicationRepository.deleteByProject(project);
        historyRepository.deleteByProject(project);
        projectRepository.delete(project);
    }

    // DTO Mapper
    private ProjectResponse map(Project project) {
        List<StatusHistoryResponse> history = historyRepository
                .findByProjectOrderByChangedAtAsc(project)
                .stream()
                .map(h -> StatusHistoryResponse.builder()
                        .fromStatus(h.getFromStatus())
                        .toStatus(h.getToStatus())
                        .changedByEmail(h.getChangedByEmail())
                        .changedAt(h.getChangedAt())
                        .build())
                .toList();

        User af = project.getAssignedFreelancer();

        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .budget(project.getBudget())
                .requiredSkills(project.getRequiredSkills())
                .status(project.getStatus())
                .clientId(project.getClient().getId())
                .clientEmail(project.getClient().getEmail())
                .assignedFreelancerId(af != null ? af.getId() : null)
                .assignedFreelancerName(af != null ? af.getFullName() : null)
                .assignedFreelancerEmail(af != null ? af.getEmail() : null)
                .allowedNextStatuses(null) // populated per-request in controller
                .statusHistory(history)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ProjectResponse mapWithAllowedStatuses(Project project, User actor) {
        ProjectResponse response = map(project);
        boolean isClient = project.getClient().getId().equals(actor.getId());
        boolean isAssignedFreelancer = project.getAssignedFreelancer() != null
                && project.getAssignedFreelancer().getId().equals(actor.getId());

        response.setAllowedNextStatuses(
                isClient || isAssignedFreelancer
                        ? ProjectStatusMachine.allowedNext(project.getStatus(), actor.getRole())
                        : Collections.emptySet());
        return response;
    }
}
