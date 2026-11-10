package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.ProfileRequest;
import com.ecoroute.dto.ProfileResponse;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProfileResponse response = userProfileService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ProfileRequest profileRequest) {
        ProfileResponse response = userProfileService.createProfile(userPrincipal.getId(), profileRequest);
        return new ResponseEntity<>(ApiResponse.success("Profile created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ProfileRequest profileRequest) {
        ProfileResponse response = userProfileService.updateProfile(userPrincipal.getId(), profileRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
