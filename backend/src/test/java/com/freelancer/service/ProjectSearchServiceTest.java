package com.freelancer.service;

import com.freelancer.enums.ProjectStatus;
import com.freelancer.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectSearchServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectSearchService projectSearchService;

    @Test
    void marketplaceSearchAlwaysExcludesDraftProjects() {
        when(projectRepository.search(
                isNull(), isNull(), isNull(), eq(ProjectStatus.DRAFT),
                isNull(), isNull(), any(Pageable.class)))
                .thenReturn(Page.empty());

        projectSearchService.search(null, null, null, null, null, 0, 10, "newest");

        ArgumentCaptor<ProjectStatus> excludedStatus = ArgumentCaptor.forClass(ProjectStatus.class);
        verify(projectRepository).search(
                isNull(), isNull(), isNull(), excludedStatus.capture(),
                isNull(), isNull(), any(Pageable.class));
        assertThat(excludedStatus.getValue()).isEqualTo(ProjectStatus.DRAFT);
    }
}
