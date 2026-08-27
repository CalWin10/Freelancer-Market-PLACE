package com.freelancer.service;

import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import com.freelancer.repository.MessageRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MessageService messageService;

    @Test
    void anUnassignedApplicantCannotReadTheProjectConversation() {
        User client = User.builder().id(1L).build();
        User applicant = User.builder().id(2L).email("applicant@example.com").build();
        Project project = Project.builder().id(5L).client(client).build();

        when(userRepository.findByEmail("applicant@example.com"))
                .thenReturn(Optional.of(applicant));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> messageService.getMessages("applicant@example.com", 5L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Access Denied");
        verifyNoInteractions(messageRepository);
    }

    @Test
    void theAssignedFreelancerCanReadTheProjectConversation() {
        User client = User.builder().id(1L).build();
        User assigned = User.builder().id(2L).email("assigned@example.com").build();
        Project project = Project.builder()
                .id(5L)
                .client(client)
                .assignedFreelancer(assigned)
                .build();

        when(userRepository.findByEmail("assigned@example.com"))
                .thenReturn(Optional.of(assigned));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));
        when(messageRepository.findByProjectOrderBySentAtAsc(project)).thenReturn(List.of());

        assertThat(messageService.getMessages("assigned@example.com", 5L)).isEmpty();
    }
}
