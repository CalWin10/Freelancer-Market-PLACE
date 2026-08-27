package com.freelancer.config;

import com.freelancer.security.CustomUserDetailsService;
import com.freelancer.security.JwtAccessDeniedHandler;
import com.freelancer.security.JwtAuthenticationEntryPoint;
import com.freelancer.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    @Test
    void corsUsesConfiguredFrontendAndAllowsPatch() {
        SecurityConfig securityConfig = new SecurityConfig(
                mock(JwtAuthenticationFilter.class),
                mock(CustomUserDetailsService.class),
                mock(JwtAuthenticationEntryPoint.class),
                mock(JwtAccessDeniedHandler.class)
        );
        ReflectionTestUtils.setField(
                securityConfig,
                "frontendUrl",
                "https://frontend.example"
        );

        CorsConfiguration cors = securityConfig.corsConfigurationSource()
                .getCorsConfiguration(new MockHttpServletRequest("OPTIONS", "/api/v1/projects"));

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOrigins()).containsExactly("https://frontend.example");
        assertThat(cors.getAllowedMethods()).contains("PATCH");
        assertThat(cors.getAllowCredentials()).isTrue();
    }
}
