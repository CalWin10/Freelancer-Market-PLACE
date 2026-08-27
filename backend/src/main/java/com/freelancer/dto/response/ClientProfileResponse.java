package com.freelancer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String companyName;
    private String contactName;
    private String bio;
    private String profilePhotoUrl;
}
