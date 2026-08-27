package com.freelancer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageRequest {

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String content;
}
