package com.ecoroute.service.impl;

import com.ecoroute.dto.ProfileRequest;
import com.ecoroute.dto.ProfileResponse;
import com.ecoroute.entity.User;
import com.ecoroute.entity.UserProfile;
import com.ecoroute.exception.BadRequestException;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.repository.UserProfileRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.service.UserProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileServiceImpl(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user id: " + userId));
        return mapToProfileResponse(profile);
    }

    @Override
    @Transactional
    public ProfileResponse createProfile(Long userId, ProfileRequest profileRequest) {
        if (userProfileRepository.existsByUserId(userId)) {
            throw new BadRequestException("Profile already exists for user id: " + userId + ". Use PUT /api/profile to update.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (profileRequest.getName() != null && !profileRequest.getName().isBlank()) {
            user.setName(profileRequest.getName());
            userRepository.save(user);
        }

        UserProfile profile = UserProfile.builder()
                .user(user)
                .age(profileRequest.getAge())
                .medicalInformation(profileRequest.getMedicalInformation())
                .vehicleType(profileRequest.getVehicleType())
                .profileCompletionStatus(true)
                .build();

        UserProfile savedProfile = userProfileRepository.save(profile);
        return mapToProfileResponse(savedProfile);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest profileRequest) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user id: " + userId + ". Create profile first."));

        User user = profile.getUser();
        if (profileRequest.getName() != null && !profileRequest.getName().isBlank()) {
            user.setName(profileRequest.getName());
            userRepository.save(user);
        }

        if (profileRequest.getAge() != null) {
            profile.setAge(profileRequest.getAge());
        }
        if (profileRequest.getMedicalInformation() != null) {
            profile.setMedicalInformation(profileRequest.getMedicalInformation());
        }
        if (profileRequest.getVehicleType() != null) {
            profile.setVehicleType(profileRequest.getVehicleType());
        }

        profile.setProfileCompletionStatus(true);
        UserProfile updatedProfile = userProfileRepository.save(profile);

        return mapToProfileResponse(updatedProfile);
    }

    private ProfileResponse mapToProfileResponse(UserProfile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .age(profile.getAge())
                .medicalInformation(profile.getMedicalInformation())
                .vehicleType(profile.getVehicleType())
                .profileCompletionStatus(profile.getProfileCompletionStatus())
                .build();
    }
}
