package com.freelancer.repository;

import com.freelancer.entity.FreelancerProfile;
import com.freelancer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {

    Optional<FreelancerProfile> findByUser(User user);

}