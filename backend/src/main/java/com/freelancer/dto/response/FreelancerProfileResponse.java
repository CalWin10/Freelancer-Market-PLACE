package com.freelancer.dto.response;

import com.freelancer.dto.PortfolioItemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String bio;
    private String location;
    private Double hourlyRate;
    private List<String> skills;
    private String profilePhotoUrl;
    private List<PortfolioItemDto> portfolioItems;
}
