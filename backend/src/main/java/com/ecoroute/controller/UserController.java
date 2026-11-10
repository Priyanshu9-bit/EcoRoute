package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.UserDTO;
import com.ecoroute.entity.User;
import com.ecoroute.entity.UserProfile;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.repository.UserProfileRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserController(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userPrincipal.getId()));
        boolean profileCompleted = userProfileRepository.findByUserId(user.getId())
                .map(UserProfile::getProfileCompletionStatus)
                .orElse(false);
        
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .profileCompleted(profileCompleted)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", userDTO));
    }
}
