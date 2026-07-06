package com.freelancer.dto.request;

import lombok.Data;

@Data
public class UpdateClientProfileRequest {

    private String companyName;

    private String contactName;

    private String bio;

    private String profilePhotoUrl;

}