package com.freelancer.controller;

import com.freelancer.dto.request.MessageRequest;
import com.freelancer.dto.response.MessageResponse;
import com.freelancer.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> send(
            Authentication authentication,
            @PathVariable Long projectId,
            @Valid @RequestBody MessageRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.send(authentication.getName(), projectId, request));
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(
            Authentication authentication,
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                messageService.getMessages(authentication.getName(), projectId));
    }
}
