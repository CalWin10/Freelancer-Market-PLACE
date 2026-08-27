package com.freelancer.dto.response;

import com.freelancer.enums.ProjectStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal budget;
    private String requiredSkills;
    private ProjectStatus status;
    private Long clientId;
    private String clientEmail;
    private Long assignedFreelancerId;
    private String assignedFreelancerName;
    private String assignedFreelancerEmail;
    private Set<ProjectStatus> allowedNextStatuses;
    private List<StatusHistoryResponse> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}