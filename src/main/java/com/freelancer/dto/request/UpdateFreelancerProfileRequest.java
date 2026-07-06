package com.freelancer.dto.request;

import lombok.Data;

@Data
public class UpdateFreelancerProfileRequest {

    private String bio;

    private String location;

    private Double hourlyRate;

    private String skills;

    private String profilePhotoUrl;

}