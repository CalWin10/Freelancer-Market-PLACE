package com.freelancer.controller;

import com.freelancer.dto.request.CreateProjectRequest;
import com.freelancer.dto.request.ProjectStatusRequest;
import com.freelancer.dto.request.UpdateProjectRequest;
import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.service.ProjectSearchService;
import com.freelancer.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectSearchService projectSearchService;

    @GetMapping("/search")
    public ResponseEntity<Page<ProjectResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(defaultValue = "0")      int page,
            @RequestParam(defaultValue = "10")     int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(
                projectSearchService.search(q, skills, status, minBudget, maxBudget, page, size, sortBy));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            Authentication authentication,
            @Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(
                projectService.createProject(authentication.getName(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ProjectResponse>> getMyProjects(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                projectService.getMyProjects(authentication.getName(), page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(
                projectService.updateProject(authentication.getName(), id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ProjectStatusRequest request) {
        return ResponseEntity.ok(
                projectService.updateStatus(authentication.getName(), id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                projectService.getProject(authentication.getName(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(
            Authentication authentication,
            @PathVariable Long id) {
        projectService.deleteProject(authentication.getName(), id);
        return ResponseEntity.ok("Project deleted successfully.");
    }
}
