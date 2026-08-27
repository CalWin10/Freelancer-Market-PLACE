package com.freelancer.repository;

import com.freelancer.entity.Message;
import com.freelancer.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProjectOrderBySentAtAsc(Project project);

    void deleteByProject(Project project);
}
