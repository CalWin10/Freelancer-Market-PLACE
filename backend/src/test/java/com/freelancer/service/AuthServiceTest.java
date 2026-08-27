package com.freelancer.service;

import com.freelancer.dto.request.RegisterRequest;
import com.freelancer.enums.Role;
import com.freelancer.repository.UserRepository;
import com.freelancer.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void publicRegistrationCannotCreateAdmin() {
        RegisterRequest request = validRequest();
        request.setRole(Role.ADMIN);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Role must be CLIENT or FREELANCER");

        verifyNoInteractions(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void serviceAlsoRejectsNullRoleBeforeSaving() {
        RegisterRequest request = validRequest();
        request.setRole(null);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Role must be CLIENT or FREELANCER");

        verifyNoInteractions(userRepository, passwordEncoder, jwtService);
    }

    private RegisterRequest validRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Taylor Client");
        request.setEmail("taylor@example.com");
        request.setPassword("password123");
        request.setRole(Role.CLIENT);
        return request;
    }
}
