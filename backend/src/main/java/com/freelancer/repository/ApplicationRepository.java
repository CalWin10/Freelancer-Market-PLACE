package com.freelancer.repository;

import com.freelancer.entity.Application;
import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByProject(Project project);

    Optional<Application> findByProjectAndFreelancer(Project project, User freelancer);

    boolean existsByProjectAndFreelancer(Project project, User freelancer);

    void deleteByProject(Project project);

    @Query("SELECT a.project.id FROM Application a WHERE a.id = :id")
    Optional<Long> findProjectIdById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Application a WHERE a.id = :id")
    Optional<Application> findByIdForUpdate(@Param("id") Long id);
}
