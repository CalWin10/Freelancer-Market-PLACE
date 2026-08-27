package com.freelancer.dto.response;

import com.freelancer.enums.ProjectStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistoryResponse {
    private ProjectStatus fromStatus;
    private ProjectStatus toStatus;
    private String changedByEmail;
    private LocalDateTime changedAt;
}
