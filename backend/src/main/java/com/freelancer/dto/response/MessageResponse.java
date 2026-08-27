package com.freelancer.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private Long projectId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String content;
    private LocalDateTime sentAt;
}
