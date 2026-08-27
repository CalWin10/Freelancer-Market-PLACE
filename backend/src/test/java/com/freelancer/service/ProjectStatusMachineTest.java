package com.freelancer.service;

import com.freelancer.enums.ProjectStatus;
import com.freelancer.enums.Role;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

class ProjectStatusMachineTest {

    // ── Valid transitions ────────────────────────────────────────────────────

    @Test
    void freelancer_can_move_assigned_to_inProgress() {
        assertThatNoException().isThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS, Role.FREELANCER));
    }

    @Test
    void client_can_move_inProgress_to_completed() {
        assertThatNoException().isThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, Role.CLIENT));
    }

    @Test
    void client_can_move_inProgress_to_cancelled() {
        assertThatNoException().isThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED, Role.CLIENT));
    }

    // ── Wrong role ───────────────────────────────────────────────────────────

    @Test
    void client_cannot_move_assigned_to_inProgress() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.ASSIGNED, ProjectStatus.IN_PROGRESS, Role.CLIENT))
            .isInstanceOf(SecurityException.class)
            .hasMessageContaining("FREELANCER");
    }

    @Test
    void freelancer_cannot_move_inProgress_to_completed() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, Role.FREELANCER))
            .isInstanceOf(SecurityException.class)
            .hasMessageContaining("CLIENT");
    }

    @Test
    void freelancer_cannot_move_inProgress_to_cancelled() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED, Role.FREELANCER))
            .isInstanceOf(SecurityException.class)
            .hasMessageContaining("CLIENT");
    }

    // ── Invalid transitions ──────────────────────────────────────────────────

    @Test
    void cannot_move_open_to_inProgress() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS, Role.FREELANCER))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid transition");
    }

    @Test
    void cannot_move_open_to_completed() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.OPEN, ProjectStatus.COMPLETED, Role.CLIENT))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid transition");
    }

    @Test
    void cannot_move_assigned_to_completed_directly() {
        assertThatThrownBy(() ->
            ProjectStatusMachine.validate(ProjectStatus.ASSIGNED, ProjectStatus.COMPLETED, Role.CLIENT))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid transition");
    }

    @Test
    void cannot_move_completed_to_any_status() {
        for (ProjectStatus next : ProjectStatus.values()) {
            if (next == ProjectStatus.COMPLETED) continue;
            assertThatThrownBy(() ->
                ProjectStatusMachine.validate(ProjectStatus.COMPLETED, next, Role.CLIENT))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void cannot_move_cancelled_to_any_status() {
        for (ProjectStatus next : ProjectStatus.values()) {
            if (next == ProjectStatus.CANCELLED) continue;
            assertThatThrownBy(() ->
                ProjectStatusMachine.validate(ProjectStatus.CANCELLED, next, Role.CLIENT))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ── allowedNext ──────────────────────────────────────────────────────────

    @Test
    void allowedNext_for_freelancer_on_assigned_returns_inProgress() {
        Set<ProjectStatus> allowed = ProjectStatusMachine.allowedNext(ProjectStatus.ASSIGNED, Role.FREELANCER);
        assertThat(allowed).containsExactly(ProjectStatus.IN_PROGRESS);
    }

    @Test
    void allowedNext_for_client_on_inProgress_returns_completed_and_cancelled() {
        Set<ProjectStatus> allowed = ProjectStatusMachine.allowedNext(ProjectStatus.IN_PROGRESS, Role.CLIENT);
        assertThat(allowed).containsExactlyInAnyOrder(ProjectStatus.COMPLETED, ProjectStatus.CANCELLED);
    }

    @Test
    void allowedNext_for_client_on_assigned_is_empty() {
        assertThat(ProjectStatusMachine.allowedNext(ProjectStatus.ASSIGNED, Role.CLIENT)).isEmpty();
    }

    @Test
    void allowedNext_for_freelancer_on_open_is_empty() {
        assertThat(ProjectStatusMachine.allowedNext(ProjectStatus.OPEN, Role.FREELANCER)).isEmpty();
    }
}
