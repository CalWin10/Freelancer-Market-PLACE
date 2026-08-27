package com.freelancer.service;

import com.freelancer.entity.Project;
import com.freelancer.entity.User;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.enums.Role;
import com.freelancer.repository.ApplicationRepository;
import com.freelancer.repository.MessageRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.ProjectStatusHistoryRepository;
import com.freelancer.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectStatusHistoryRepository historyRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void deleteRemovesDependentsBeforeProject() {
        User client = User.builder()
                .id(1L)
                .email("client@example.com")
                .build();
        Project project = Project.builder()
                .id(5L)
                .client(client)
                .status(ProjectStatus.OPEN)
                .build();

        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(client));
        when(projectRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(project));

        projectService.deleteProject("client@example.com", 5L);

        InOrder order = inOrder(
                messageRepository,
                applicationRepository,
                historyRepository,
                projectRepository
        );
        order.verify(messageRepository).deleteByProject(project);
        order.verify(applicationRepository).deleteByProject(project);
        order.verify(historyRepository).deleteByProject(project);
        order.verify(projectRepository).delete(project);
    }

    @Test
    void unrelatedFreelancerGetsNoAllowedStatusTransitions() {
        User client = User.builder().id(1L).email("client@example.com").role(Role.CLIENT).build();
        User assigned = User.builder().id(2L).email("assigned@example.com").role(Role.FREELANCER).build();
        User caller = User.builder().id(3L).email("other@example.com").role(Role.FREELANCER).build();
        Project project = Project.builder()
                .id(5L)
                .client(client)
                .assignedFreelancer(assigned)
                .status(ProjectStatus.ASSIGNED)
                .build();

        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(caller));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));

        var response = projectService.getProject("other@example.com", 5L);

        assertThat(response.getAllowedNextStatuses()).isEmpty();
    }

    @Test
    void assignedFreelancerGetsTheirAllowedStatusTransition() {
        User client = User.builder().id(1L).email("client@example.com").role(Role.CLIENT).build();
        User assigned = User.builder().id(2L).email("assigned@example.com").role(Role.FREELANCER).build();
        Project project = Project.builder()
                .id(5L)
                .client(client)
                .assignedFreelancer(assigned)
                .status(ProjectStatus.ASSIGNED)
                .build();

        when(userRepository.findByEmail("assigned@example.com")).thenReturn(Optional.of(assigned));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));

        var response = projectService.getProject("assigned@example.com", 5L);

        assertThat(response.getAllowedNextStatuses()).containsExactly(ProjectStatus.IN_PROGRESS);
    }

    @Test
    void draftDetailIsHiddenFromEveryoneExceptItsOwner() {
        User owner = User.builder().id(1L).email("owner@example.com").role(Role.CLIENT).build();
        User other = User.builder().id(2L).email("other@example.com").role(Role.CLIENT).build();
        Project draft = Project.builder()
                .id(5L)
                .client(owner)
                .status(ProjectStatus.DRAFT)
                .build();

        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(draft));

        org.assertj.core.api.Assertions.assertThatThrownBy(
                        () -> projectService.getProject("other@example.com", 5L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Access Denied");
    }

    @Test
    void draftOwnerCanFetchTheirProject() {
        User owner = User.builder().id(1L).email("owner@example.com").role(Role.CLIENT).build();
        Project draft = Project.builder()
                .id(5L)
                .client(owner)
                .status(ProjectStatus.DRAFT)
                .build();

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(projectRepository.findById(5L)).thenReturn(Optional.of(draft));

        assertThat(projectService.getProject("owner@example.com", 5L).getStatus())
                .isEqualTo(ProjectStatus.DRAFT);
    }
}
