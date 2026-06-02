package com.aegisbank.security;

import com.aegisbank.dto.request.LoginRequest;
import com.aegisbank.dto.request.RegisterRequest;
import com.aegisbank.dto.response.UserResponse;
import com.aegisbank.entity.User;
import com.aegisbank.enums.UserRole;
import com.aegisbank.enums.UserStatus;
import com.aegisbank.exception.DuplicateResourceException;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.impl.AuthServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EntityMapper entityMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_shouldFailWhenEmailExists() {

        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@test.com")
                .phoneNumber("+1234567890")
                .password("Test@1234")
                .build();

        when(userRepository.existsByEmail("test@test.com"))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> authService.register(request));
    }

    @Test
    void login_shouldFailWithInvalidCredentials() {

        LoginRequest request = LoginRequest.builder()
                .email("test@test.com")
                .password("wrong")
                .build();

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(request));
    }

    @Test
    void login_shouldSucceedWithValidCredentials() {

        LoginRequest request = LoginRequest.builder()
                .email("test@test.com")
                .password("Test@1234")
                .build();

        User user = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("encodedPassword")
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .email("test@test.com")
                .fullName("Test User")
                .build();

        when(authenticationManager.authenticate(any()))
                .thenReturn(
                        new UsernamePasswordAuthenticationToken(
                                "test@test.com",
                                "Test@1234"
                        )
                );

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(jwtTokenProvider.generateToken(any()))
                .thenReturn("jwt-token");

        when(jwtProperties.getExpirationMs())
                .thenReturn(86400000L);

        when(entityMapper.toUserResponse(user))
                .thenReturn(userResponse);

        var response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
    }
}