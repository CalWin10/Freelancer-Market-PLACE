package com.freelancer.service;

import com.freelancer.enums.ProjectStatus;
import com.freelancer.enums.Role;

import java.util.Map;
import java.util.Set;

/**
 * Encodes all valid status transitions and who may perform them.
 * ASSIGNED → IN_PROGRESS  : FREELANCER only
 * IN_PROGRESS → COMPLETED : CLIENT only
 * IN_PROGRESS → CANCELLED : CLIENT only
 */
public class ProjectStatusMachine {

    private record Transition(ProjectStatus from, ProjectStatus to) {}

    private static final Map<Transition, Role> ALLOWED = Map.of(
        new Transition(ProjectStatus.ASSIGNED,    ProjectStatus.IN_PROGRESS), Role.FREELANCER,
        new Transition(ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED),   Role.CLIENT,
        new Transition(ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED),   Role.CLIENT
    );

    /** @throws IllegalArgumentException on invalid transition or wrong role */
    public static void validate(ProjectStatus current, ProjectStatus next, Role actorRole) {
        Role required = ALLOWED.get(new Transition(current, next));
        if (required == null) {
            throw new IllegalArgumentException(
                "Invalid transition: " + current + " → " + next);
        }
        if (actorRole != required) {
            throw new SecurityException(
                "Only " + required + " can move project from " + current + " to " + next);
        }
    }

    public static Set<ProjectStatus> allowedNext(ProjectStatus current, Role role) {
        return ALLOWED.entrySet().stream()
            .filter(e -> e.getKey().from() == current && e.getValue() == role)
            .map(e -> e.getKey().to())
            .collect(java.util.stream.Collectors.toSet());
    }
}
