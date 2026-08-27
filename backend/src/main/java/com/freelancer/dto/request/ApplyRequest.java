package com.freelancer.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApplyRequest {

    @Size(max = 3000, message = "Proposal message must not exceed 3000 characters")
    private String message;
}
