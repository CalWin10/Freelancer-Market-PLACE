package com.freelancer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfileResponse {

    private Long id;

    private String bio;

    private String location;

    private Double hourlyRate;

    private String skills;

    private String profilePhotoUrl;
}