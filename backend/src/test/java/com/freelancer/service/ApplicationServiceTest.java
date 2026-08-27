package com.freelancer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.entity.Application;
import com.freelancer.entity.Project;
import com.freelancer.entity.ProjectStatusHistory;
import com.freelancer.entity.User;
import com.freelancer.dto.request.ApplyRequest;
import com.freelancer.enums.ApplicationStatus;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.repository.ApplicationRepository;
import com.freelancer.repository.FreelancerProfileRepository;
import com.freelancer.repository.ProjectRepository;
import com.freelancer.repository.ProjectStatusHistoryRepository;
import com.freelancer.repository.UserRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FreelancerProfileRepository freelancerProfileRepository;
    @Mock
    private ProjectStatusHistoryRepository historyRepository;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    void acceptRejectsAnAlreadyProcessedApplication() {
        Application application = ownedApplication(ApplicationStatus.ACCEPTED);
        stubApplication(application);

        assertThatThrownBy(() -> applicationService.accept("client@example.com", 10L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Application has already been processed");

        verify(projectRepository, never()).save(any());
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void rejectRejectsAnAlreadyProcessedApplication() {
        Application application = ownedApplication(ApplicationStatus.REJECTED);
        stubApplication(application);

        assertThatThrownBy(() -> applicationService.reject("client@example.com", 10L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Application has already been processed");

        verify(applicationRepository, never()).save(any());
    }

    @Test
    void acceptLocksProjectBeforeApplicationAndRecordsAssignmentHistory() {
        User client = User.builder()
                .id(1L)
                .email("client@example.com")
                .build();
        User freelancer = User.builder()
                .id(2L)
                .email("freelancer@example.com")
                .fullName("Taylor Freelancer")
                .build();
        Project project = Project.builder()
                .id(5L)
                .title("Build a marketplace")
                .client(client)
                .status(ProjectStatus.OPEN)
                .build();
        Application application = Application.builder()
                .id(10L)
                .project(project)
                .freelancer(freelancer)
                .status(ApplicationStatus.PENDING)
                .build();

        stubApplication(application);
        when(applicationRepository.findByProject(project)).thenReturn(List.of(application));
        when(applicationRepository.save(application)).thenReturn(application);
        when(freelancerProfileRepository.findByUser(freelancer)).thenReturn(Optional.empty());

        var response = applicationService.accept("client@example.com", 10L);

        assertThat(response.getStatus()).isEqualTo(ApplicationStatus.ACCEPTED);
        assertThat(project.getStatus()).isEqualTo(ProjectStatus.ASSIGNED);
        assertThat(project.getAssignedFreelancer()).isSameAs(freelancer);

        ArgumentCaptor<ProjectStatusHistory> historyCaptor =
                ArgumentCaptor.forClass(ProjectStatusHistory.class);
        verify(historyRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getFromStatus()).isEqualTo(ProjectStatus.OPEN);
        assertThat(historyCaptor.getValue().getToStatus()).isEqualTo(ProjectStatus.ASSIGNED);
        assertThat(historyCaptor.getValue().getChangedByEmail()).isEqualTo("client@example.com");

        InOrder lockOrder = inOrder(applicationRepository, projectRepository);
        lockOrder.verify(applicationRepository).findProjectIdById(10L);
        lockOrder.verify(projectRepository).findByIdForUpdate(5L);
        lockOrder.verify(applicationRepository).findByIdForUpdate(10L);
    }

    @Test
    void databaseDuplicateDuringApplyIsReturnedAsKnownConflict() {
        User freelancer = User.builder().id(2L).email("freelancer@example.com").build();
        Project project = Project.builder()
                .id(5L)
                .client(User.builder().id(1L).build())
                .status(ProjectStatus.OPEN)
                .build();
        ApplyRequest request = new ApplyRequest();

        when(userRepository.findByEmail("freelancer@example.com"))
                .thenReturn(Optional.of(freelancer));
        when(projectRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(project));
        when(applicationRepository.existsByProjectAndFreelancer(project, freelancer)).thenReturn(false);
        when(applicationRepository.saveAndFlush(any(Application.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        assertThatThrownBy(() -> applicationService.apply("freelancer@example.com", 5L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Already applied to this project");
    }

    private Application ownedApplication(ApplicationStatus status) {
        User client = User.builder()
                .id(1L)
                .email("client@example.com")
                .build();
        Project project = Project.builder()
                .id(5L)
                .client(client)
                .status(ProjectStatus.OPEN)
                .build();
        return Application.builder()
                .id(10L)
                .project(project)
                .status(status)
                .build();
    }

    private void stubApplication(Application application) {
        when(userRepository.findByEmail("client@example.com"))
                .thenReturn(Optional.of(application.getProject().getClient()));
        when(applicationRepository.findProjectIdById(10L))
                .thenReturn(Optional.of(application.getProject().getId()));
        when(projectRepository.findByIdForUpdate(application.getProject().getId()))
                .thenReturn(Optional.of(application.getProject()));
        when(applicationRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(application));
    }
}
