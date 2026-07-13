package com.freelancer.controller;

import com.freelancer.dto.request.CreateProjectRequest;
import com.freelancer.dto.request.UpdateProjectRequest;
import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // Create Project
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            Authentication authentication,
            @Valid @RequestBody CreateProjectRequest request) {

        return ResponseEntity.ok(
                projectService.createProject(authentication.getName(), request)
        );
    }

    // Get My Projects — must be declared BEFORE /{id} to avoid route conflict
    @GetMapping("/my")
    public ResponseEntity<Page<ProjectResponse>> getMyProjects(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                projectService.getMyProjects(authentication.getName(), page, size)
        );
    }

    // Update Project
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {

        return ResponseEntity.ok(
                projectService.updateProject(authentication.getName(), id, request)
        );
    }

    // Get Single Project
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                projectService.getProject(authentication.getName(), id)
        );
    }

    // Delete Project
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(
            Authentication authentication,
            @PathVariable Long id) {

        projectService.deleteProject(authentication.getName(), id);

        return ResponseEntity.ok("Project deleted successfully.");
    }
}