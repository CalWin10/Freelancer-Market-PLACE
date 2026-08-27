package com.freelancer.entity;

import jakarta.persistence.Table;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ApplicationTest {

    @Test
    void projectAndFreelancerAreProtectedByADatabaseUniqueConstraint() {
        Table table = Application.class.getAnnotation(Table.class);

        boolean hasExpectedConstraint = Arrays.stream(table.uniqueConstraints())
                .anyMatch(constraint -> Set.of(constraint.columnNames())
                        .equals(Set.of("project_id", "freelancer_id")));

        assertThat(hasExpectedConstraint).isTrue();
    }
}
