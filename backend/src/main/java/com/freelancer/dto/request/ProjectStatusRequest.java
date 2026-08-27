package com.freelancer.dto.request;

import com.freelancer.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectStatusRequest {

    @NotNull(message = "status is required")
    private ProjectStatus status;
}
