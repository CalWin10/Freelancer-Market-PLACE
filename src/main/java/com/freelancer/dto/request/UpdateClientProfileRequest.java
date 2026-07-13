package com.freelancer.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClientProfileRequest {

    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    @Size(max = 200, message = "Contact name must not exceed 200 characters")
    private String contactName;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;
}
