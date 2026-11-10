package com.ecoroute.service.impl;

import com.ecoroute.dto.SavedRouteRequest;
import com.ecoroute.dto.SavedRouteResponse;
import com.ecoroute.entity.SavedRoute;
import com.ecoroute.entity.User;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.exception.UnauthorizedAccessException;
import com.ecoroute.repository.SavedRouteRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.service.SavedRouteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavedRouteServiceImpl implements SavedRouteService {

    private final SavedRouteRepository savedRouteRepository;
    private final UserRepository userRepository;

    public SavedRouteServiceImpl(SavedRouteRepository savedRouteRepository, UserRepository userRepository) {
        this.savedRouteRepository = savedRouteRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SavedRouteResponse saveRoute(Long userId, SavedRouteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SavedRoute savedRoute = new SavedRoute();
        savedRoute.setUser(user);
        savedRoute.setSource(request.getSource());
        savedRoute.setDestination(request.getDestination());
        savedRoute.setVehicleType(request.getVehicleType());
        savedRoute.setDistance(request.getDistance());

        SavedRoute saved = savedRouteRepository.save(savedRoute);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedRouteResponse> getUserSavedRoutes(Long userId) {
        return savedRouteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSavedRoute(Long userId, Long routeId) {
        SavedRoute route = savedRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved route not found"));

        if (!route.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Not authorized to delete this route");
        }

        savedRouteRepository.delete(route);
    }

    private SavedRouteResponse mapToResponse(SavedRoute route) {
        return new SavedRouteResponse(
                route.getId(),
                route.getSource(),
                route.getDestination(),
                route.getVehicleType(),
                route.getDistance(),
                route.getCreatedAt()
        );
    }
}
