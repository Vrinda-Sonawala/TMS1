package com.aegisbank.service;

import com.aegisbank.dto.request.LoginRequest;
import com.aegisbank.dto.request.RegisterRequest;
import com.aegisbank.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
