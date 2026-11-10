package com.ecoroute.service.impl;

import com.ecoroute.dto.*;
import com.ecoroute.entity.SavedRoute;
import com.ecoroute.entity.User;
import com.ecoroute.entity.UserProfile;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.repository.JourneyRepository;
import com.ecoroute.repository.SavedRouteRepository;
import com.ecoroute.repository.UserProfileRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.service.DashboardService;
import com.ecoroute.service.JourneyService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final JourneyRepository journeyRepository;
    private final SavedRouteRepository savedRouteRepository;
    private final JourneyService journeyService;

    public DashboardServiceImpl(UserRepository userRepository, UserProfileRepository userProfileRepository, JourneyRepository journeyRepository, SavedRouteRepository savedRouteRepository, JourneyService journeyService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.journeyRepository = journeyRepository;
        this.savedRouteRepository = savedRouteRepository;
        this.journeyService = journeyService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

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

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        ProfileResponse profileResponse = null;
        DashboardResponse.DashboardPreferences preferences = new DashboardResponse.DashboardPreferences("Not Set", "Not Set");

        if (profile != null) {
            profileResponse = ProfileResponse.builder()
                    .id(profile.getId())
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .age(profile.getAge())
                    .medicalInformation(profile.getMedicalInformation())
                    .vehicleType(profile.getVehicleType())
                    .profileCompletionStatus(profile.getProfileCompletionStatus())
                    .build();
            
            if (profile.getVehicleType() != null) {
                preferences.setVehicle(profile.getVehicleType().name());
            }
        }

        List<JourneyResponse> recentJourneys = journeyRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5))
                .stream()
                .map(journeyService::mapToJourneyResponse)
                .toList();

        List<SavedRouteResponse> savedRoutes = savedRouteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(route -> new SavedRouteResponse(
                        route.getId(),
                        route.getSource(),
                        route.getDestination(),
                        route.getVehicleType(),
                        route.getDistance(),
                        route.getCreatedAt()
                ))
                .toList();

        return new DashboardResponse(userDTO, profileResponse, recentJourneys, savedRoutes, preferences);
    }
}

