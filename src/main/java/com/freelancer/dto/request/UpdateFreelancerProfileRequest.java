package com.freelancer.dto.request;

import com.freelancer.dto.PortfolioItemDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateFreelancerProfileRequest {

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    private String location;

    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be positive")
    private Double hourlyRate;

    // JSON array of skill strings e.g. ["Java","React"]
    private List<String> skills;

    @Valid
    private List<PortfolioItemDto> portfolioItems;
}
