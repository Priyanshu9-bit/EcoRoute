package com.ecoroute.service;

import com.ecoroute.dto.JourneyRequest;
import com.ecoroute.dto.JourneyResponse;
import com.ecoroute.entity.Journey;

import java.util.List;

public interface JourneyService {
    JourneyResponse createJourney(Long userId, JourneyRequest request);
    List<JourneyResponse> getUserJourneys(Long userId);
    JourneyResponse getJourneyById(Long userId, Long journeyId);
    JourneyResponse updateJourney(Long userId, Long journeyId, JourneyRequest request);
    void deleteJourney(Long userId, Long journeyId);
    JourneyResponse mapToJourneyResponse(Journey journey);
    JourneyResponse regenerateRoutes(Long userId, Long journeyId);
    JourneyResponse selectRoute(Long userId, Long journeyId, Long routeId);
}
