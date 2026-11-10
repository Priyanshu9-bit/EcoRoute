package com.ecoroute.service;

import com.ecoroute.dto.AuthResponse;
import com.ecoroute.dto.LoginRequest;
import com.ecoroute.dto.RegisterRequest;
import com.ecoroute.dto.UserDTO;

public interface AuthService {
    UserDTO register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
}
