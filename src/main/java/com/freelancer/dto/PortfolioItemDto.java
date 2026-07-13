package com.freelancer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioItemDto {

    private Long id;

    @NotBlank(message = "Portfolio item title is required")
    private String title;

    private String description;

    private String projectUrl;

    private String imageUrl;
}
