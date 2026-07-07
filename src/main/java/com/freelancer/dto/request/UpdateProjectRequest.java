package com.freelancer.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectRequest {

    private String title;

    private String description;

    private BigDecimal budget;

    private String requiredSkills;

}