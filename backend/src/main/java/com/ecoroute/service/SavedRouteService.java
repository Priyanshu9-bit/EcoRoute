package com.ecoroute.service;

import com.ecoroute.dto.SavedRouteRequest;
import com.ecoroute.dto.SavedRouteResponse;

import java.util.List;

public interface SavedRouteService {
    SavedRouteResponse saveRoute(Long userId, SavedRouteRequest request);
    List<SavedRouteResponse> getUserSavedRoutes(Long userId);
    void deleteSavedRoute(Long userId, Long routeId);
}
