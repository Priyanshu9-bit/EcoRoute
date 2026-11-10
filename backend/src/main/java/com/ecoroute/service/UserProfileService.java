package com.ecoroute.service;

import com.ecoroute.dto.ProfileRequest;
import com.ecoroute.dto.ProfileResponse;

public interface UserProfileService {
    ProfileResponse getProfile(Long userId);
    ProfileResponse createProfile(Long userId, ProfileRequest profileRequest);
    ProfileResponse updateProfile(Long userId, ProfileRequest profileRequest);
}
