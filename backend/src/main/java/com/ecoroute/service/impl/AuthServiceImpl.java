package com.ecoroute.service.impl;

import com.ecoroute.dto.AuthResponse;
import com.ecoroute.dto.LoginRequest;
import com.ecoroute.dto.RegisterRequest;
import com.ecoroute.dto.UserDTO;
import com.ecoroute.entity.AccountStatus;
import com.ecoroute.entity.Role;
import com.ecoroute.entity.User;
import com.ecoroute.entity.UserProfile;
import com.ecoroute.exception.BadRequestException;
import com.ecoroute.exception.DuplicateEmailException;
import com.ecoroute.repository.UserProfileRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.security.JwtTokenProvider;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.AuthService;
import com.ecoroute.service.EmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository, UserProfileRepository userProfileRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, EmailService emailService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public UserDTO register(RegisterRequest registerRequest) {
        if (!emailService.isValidEmailFormat(registerRequest.getEmail())) {
            throw new BadRequestException("Invalid email format");
        }

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.ROLE_USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // Automatically create a linked user_profile row as per requirements
        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .profileCompletionStatus(false)
                .build();
        userProfileRepository.save(profile);

        return UserDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .accountStatus(savedUser.getAccountStatus())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .profileCompleted(false)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userPrincipal.getId());
        boolean profileCompleted = profileOpt.map(UserProfile::getProfileCompletionStatus).orElse(false);

        return AuthResponse.builder()
                .token(jwt)
                .userId(userPrincipal.getId())
                .name(userPrincipal.getName())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                .profileCompleted(profileCompleted)
                .build();
    }
}
