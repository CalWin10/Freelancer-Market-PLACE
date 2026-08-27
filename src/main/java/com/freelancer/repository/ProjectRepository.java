package com.freelancer.repository;

import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByClient(User client, Pageable pageable);

}