package com.freelancer.config;

import com.freelancer.controller.ProjectController;
import com.freelancer.dto.response.ProjectResponse;
import com.freelancer.enums.ProjectStatus;
import com.freelancer.security.CustomUserDetailsService;
import com.freelancer.security.JwtAccessDeniedHandler;
import com.freelancer.security.JwtAuthenticationEntryPoint;
import com.freelancer.security.JwtAuthenticationFilter;
import com.freelancer.security.JwtService;
import com.freelancer.service.ProjectSearchService;
import com.freelancer.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class
})
class ProjectSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;
    @MockBean
    private ProjectSearchService projectSearchService;
    @MockBean
    private JwtService jwtService;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        when(projectService.getProject(anyString(), anyLong())).thenReturn(
                ProjectResponse.builder().status(ProjectStatus.OPEN).build()
        );
        when(projectService.updateStatus(anyString(), anyLong(), any())).thenReturn(
                ProjectResponse.builder().status(ProjectStatus.IN_PROGRESS).build()
        );
    }

    @Test
    @WithMockUser(roles = "FREELANCER")
    void freelancerCannotUseClientProjectManagementEndpoints() throws Exception {
        String projectBody = """
                {
                  "title": "Build a marketplace",
                  "description": "Create the responsive frontend",
                  "budget": 1200,
                  "requiredSkills": "React"
                }
                """;

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectBody))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/projects/my"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/projects/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectBody))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/projects/5"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "FREELANCER")
    void freelancerCanStillReachProjectDetailAndStatusRoutes() throws Exception {
        mockMvc.perform(get("/api/v1/projects/5"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/v1/projects/5/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk());
    }
}
