package com.freelancer.repository;

import com.freelancer.entity.Project;
import com.freelancer.entity.ProjectStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectStatusHistoryRepository extends JpaRepository<ProjectStatusHistory, Long> {
    List<ProjectStatusHistory> findByProjectOrderByChangedAtAsc(Project project);

    void deleteByProject(Project project);
}
