package com.freelancer.dto.response;

import com.freelancer.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ApplicationResponse {

    private Long id;
    private Long projectId;
    private String projectTitle;

    // Applicant info
    private Long freelancerId;
    private String freelancerName;
    private String freelancerEmail;
    private String freelancerLocation;
    private Double freelancerHourlyRate;
    private List<String> freelancerSkills;
    private String freelancerPhotoUrl;
    private String freelancerBio;

    private String message;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}
