package com.freelancer.repository;

import com.freelancer.entity.FreelancerProfile;
import com.freelancer.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {

    Optional<FreelancerProfile> findByUser(User user);

    @Query("""
            SELECT f FROM FreelancerProfile f
            WHERE (:skills    IS NULL OR LOWER(f.skills)    LIKE LOWER(CONCAT('%',:skills,'%')))
            AND   (:location  IS NULL OR LOWER(f.location)  LIKE LOWER(CONCAT('%',:location,'%')))
            AND   (:minRate   IS NULL OR f.hourlyRate       >= :minRate)
            AND   (:maxRate   IS NULL OR f.hourlyRate       <= :maxRate)
            """)
    Page<FreelancerProfile> search(
            @Param("skills")   String skills,
            @Param("location") String location,
            @Param("minRate")  Double minRate,
            @Param("maxRate")  Double maxRate,
            Pageable pageable);
}