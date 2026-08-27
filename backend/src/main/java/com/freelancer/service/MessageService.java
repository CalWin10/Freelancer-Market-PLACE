package com.freelancer.service;

import com.freelancer.dto.request.MessageRequest;
import com.freelancer.dto.response.MessageResponse;
import com.freelancer.entity.Message;
import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import com.freelancer.repository.MessageRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse send(String email, Long projectId, MessageRequest request) {
        User sender  = getUser(email);
        Project project = getProject(projectId);
        assertParty(sender, project);

        Message msg = Message.builder()
                .project(project)
                .sender(sender)
                .content(request.getContent())
                .build();

        return toResponse(messageRepository.save(msg));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String email, Long projectId) {
        User caller  = getUser(email);
        Project project = getProject(projectId);
        assertParty(caller, project);

        return messageRepository.findByProjectOrderBySentAtAsc(project)
                .stream().map(this::toResponse).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /** Only the project owner and currently assigned freelancer share a thread. */
    private void assertParty(User user, Project project) {
        boolean isClient = project.getClient().getId().equals(user.getId());
        boolean isAssignedFreelancer = project.getAssignedFreelancer() != null
                && project.getAssignedFreelancer().getId().equals(user.getId());
        if (!isClient && !isAssignedFreelancer) {
            throw new RuntimeException("Access Denied");
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private MessageResponse toResponse(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .projectId(msg.getProject().getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getFullName())
                .senderEmail(msg.getSender().getEmail())
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .build();
    }
}
