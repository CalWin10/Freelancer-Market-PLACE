package com.freelancer.repository;

import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import com.freelancer.enums.ProjectStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByClient(User client, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT p FROM Project p
            WHERE p.status <> :excludedStatus
            AND   (:q         IS NULL OR LOWER(p.title)          LIKE LOWER(CONCAT('%',:q,'%'))
                                     OR LOWER(p.description)    LIKE LOWER(CONCAT('%',:q,'%')))
            AND   (:skills    IS NULL OR LOWER(p.requiredSkills) LIKE LOWER(CONCAT('%',:skills,'%')))
            AND   (:status    IS NULL OR p.status                = :status)
            AND   (:minBudget IS NULL OR p.budget               >= :minBudget)
            AND   (:maxBudget IS NULL OR p.budget               <= :maxBudget)
            """)
    Page<Project> search(
            @Param("q")         String q,
            @Param("skills")    String skills,
            @Param("status")    ProjectStatus status,
            @Param("excludedStatus") ProjectStatus excludedStatus,
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            Pageable pageable);
}
