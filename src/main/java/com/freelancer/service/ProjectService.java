package com.freelancer.service;

import com.freelancer.dto.request.CreateProjectRequest;
import com.freelancer.dto.request.UpdateProjectRequest;
import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // CREATE PROJECT
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

        Project savedProject = projectRepository.save(project);

        return map(savedProject);
    }

    // GET SINGLE PROJECT
    public ProjectResponse getProject(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }
        return map(project);
    }

    // GET MY PROJECTS
    public Page<ProjectResponse> getMyProjects(String email, int page, int size) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectRepository.findByClient(user, PageRequest.of(page, size))
                .map(this::map);
    }

    // UPDATE PROJECT
    public ProjectResponse updateProject(
            String email,
            Long id,
            UpdateProjectRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check Owner
        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }

        // Allow only OPEN or DRAFT
        if (project.getStatus() != ProjectStatus.OPEN &&
                project.getStatus() != ProjectStatus.DRAFT) {

            throw new RuntimeException(
                    "Only OPEN or DRAFT projects can be edited");
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        project.setRequiredSkills(request.getRequiredSkills());

        Project updatedProject = projectRepository.save(project);

        return map(updatedProject);
    }

    // DELETE PROJECT
    public void deleteProject(String email, Long id) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check Owner
        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }

        // Allow only OPEN or DRAFT
        if (project.getStatus() != ProjectStatus.OPEN &&
                project.getStatus() != ProjectStatus.DRAFT) {

            throw new RuntimeException(
                    "Only OPEN or DRAFT projects can be deleted");
        }

        projectRepository.delete(project);
    }

    // DTO Mapper
    private ProjectResponse map(Project project) {

        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .budget(project.getBudget())
                .requiredSkills(project.getRequiredSkills())
                .status(project.getStatus())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}