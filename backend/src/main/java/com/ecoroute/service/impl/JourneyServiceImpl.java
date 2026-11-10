package com.ecoroute.service.impl;

import com.ecoroute.dto.JourneyRequest;
import com.ecoroute.dto.JourneyResponse;
import com.ecoroute.entity.Journey;
import com.ecoroute.entity.RequiredFacility;
import com.ecoroute.entity.JourneyStatus;
import com.ecoroute.entity.User;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.exception.UnauthorizedAccessException;
import com.ecoroute.dto.RouteDTO;
import com.ecoroute.dto.FacilityDTO;
import com.ecoroute.entity.Route;
import com.ecoroute.repository.JourneyRepository;
import com.ecoroute.repository.RouteRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.service.JourneyService;
import com.ecoroute.service.NearbyFacilityService;
import com.ecoroute.service.RoutingService;
import com.ecoroute.service.WeatherService;
import com.ecoroute.service.AirQualityService;
import com.ecoroute.dto.WeatherDTO;
import com.ecoroute.dto.AirQualityDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class JourneyServiceImpl implements JourneyService {

    private final JourneyRepository journeyRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final RoutingService routingService;
    private final NearbyFacilityService nearbyFacilityService;
    private final WeatherService weatherService;
    private final AirQualityService airQualityService;
    private final ObjectMapper objectMapper;

    public JourneyServiceImpl(JourneyRepository journeyRepository, UserRepository userRepository, RouteRepository routeRepository, RoutingService routingService, NearbyFacilityService nearbyFacilityService, WeatherService weatherService, AirQualityService airQualityService, ObjectMapper objectMapper) {
        this.journeyRepository = journeyRepository;
        this.userRepository = userRepository;
        this.routeRepository = routeRepository;
        this.routingService = routingService;
        this.nearbyFacilityService = nearbyFacilityService;
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public JourneyResponse createJourney(Long userId, JourneyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LocalDateTime journeyDate = request.getJourneyDate() != null ? request.getJourneyDate() : LocalDateTime.now();

        Journey journey = Journey.builder()
                .user(user)
                .source(request.getSource())
                .destination(request.getDestination())
                .sourceLat(request.getSourceLat())
                .sourceLng(request.getSourceLng())
                .destLat(request.getDestLat())
                .destLng(request.getDestLng())
                .travelType(request.getTravelType())
                .vehicleType(request.getVehicleType())
                .journeyDate(journeyDate)
                .status(JourneyStatus.PLANNED)
                .distance(request.getDistance())
                .duration(request.getDuration())
                .routePreferences(request.getRoutePreferences() != null ? request.getRoutePreferences() : new HashSet<>())
                .requiredFacilities(request.getRequiredFacilities() != null ? request.getRequiredFacilities() : new HashSet<>())
                .build();

        Journey savedJourney = journeyRepository.save(journey);
        
        List<RouteDTO> generatedRoutes = new ArrayList<>();
        if (request.getSourceLat() != null && request.getSourceLng() != null && request.getDestLat() != null && request.getDestLng() != null) {
            String profile = "driving-car";
            if (request.getVehicleType() != null) {
                switch(request.getVehicleType()) {
                    case BIKE: profile = "cycling-regular"; break;
                    case BUS: profile = "driving-hgv"; break;
                    case TRUCK: profile = "driving-hgv"; break;
                    case CAR:
                    case EV:
                    default: profile = "driving-car"; break;
                }
            }
            try {
                generatedRoutes = routingService.calculateRoutes(request.getSourceLat(), request.getSourceLng(), request.getDestLat(), request.getDestLng(), profile);
                List<Route> routesToSave = new ArrayList<>();
                java.util.Map<String, List<FacilityDTO>> facilityCache = new java.util.HashMap<>();

                for (RouteDTO dto : generatedRoutes) {
                    Route route = new Route();
                    route.setJourney(savedJourney);
                    route.setDistance(dto.getDistance());
                    route.setDuration(dto.getDuration());
                    route.setProfile(dto.getProfile());
                    route.setSummary(dto.getSummary());
                    route.setGeometry(objectMapper.writeValueAsString(dto.getGeometry()));

                    List<FacilityDTO> allFacilities = new ArrayList<>();
                    if (dto.getGeometry() != null && !dto.getGeometry().isEmpty()) {
                        int size = dto.getGeometry().size();
                        int[] indices = {0, size / 2, size - 1};
                        for (int idx : indices) {
                            if (idx >= 0 && idx < size) {
                                List<Double> pt = dto.getGeometry().get(idx);
                                Double lat = pt.get(0);
                                Double lng = pt.get(1);
                                String coordKey = String.format(java.util.Locale.US, "%.4f_%.4f", lat, lng);
                                
                                if (request.getRequiredFacilities() != null && !request.getRequiredFacilities().isEmpty()) {
                                    for (RequiredFacility facility : request.getRequiredFacilities()) {
                                        String cacheKey = coordKey + "_" + facility.name();
                                        if (!facilityCache.containsKey(cacheKey)) {
                                            facilityCache.put(cacheKey, nearbyFacilityService.getNearbyFacilities(lat, lng, facility.name(), 15.0));
                                        }
                                        allFacilities.addAll(facilityCache.get(cacheKey));
                                    }
                                } else {
                                    String cacheKey = coordKey + "_ALL";
                                    if (!facilityCache.containsKey(cacheKey)) {
                                        facilityCache.put(cacheKey, nearbyFacilityService.getNearbyFacilities(lat, lng, "ALL", 15.0));
                                    }
                                    allFacilities.addAll(facilityCache.get(cacheKey));
                                }
                            }
                        }
                    }
                    List<FacilityDTO> uniqueFacilities = new ArrayList<>();
                    for (FacilityDTO f : allFacilities) {
                        boolean exists = uniqueFacilities.stream().anyMatch(e -> 
                            e.getName() != null && e.getName().equals(f.getName()) && 
                            e.getLatitude() != null && e.getLatitude().equals(f.getLatitude())
                        );
                        if (!exists) {
                            uniqueFacilities.add(f);
                        }
                    }
                    route.setFacilitiesData(objectMapper.writeValueAsString(uniqueFacilities));
                    routesToSave.add(route);
                }
                List<Route> savedRoutes = routeRepository.saveAll(routesToSave);
                savedJourney.setRoutes(savedRoutes);
            } catch (Exception ex) {
                // log.error("Failed to generate and save routes", ex);
            }
        }

        return mapToJourneyResponse(savedJourney);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JourneyResponse> getUserJourneys(Long userId) {
        return journeyRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToJourneyResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JourneyResponse getJourneyById(Long userId, Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));

        if (!journey.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to access this journey");
        }

        return mapToJourneyResponse(journey);
    }

    @Override
    @Transactional
    public JourneyResponse updateJourney(Long userId, Long journeyId, JourneyRequest request) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));

        if (!journey.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to modify this journey");
        }

        if (request.getSource() != null && !request.getSource().isBlank()) {
            journey.setSource(request.getSource());
        }
        if (request.getDestination() != null && !request.getDestination().isBlank()) {
            journey.setDestination(request.getDestination());
        }
        if (request.getSourceLat() != null) {
            journey.setSourceLat(request.getSourceLat());
        }
        if (request.getSourceLng() != null) {
            journey.setSourceLng(request.getSourceLng());
        }
        if (request.getDestLat() != null) {
            journey.setDestLat(request.getDestLat());
        }
        if (request.getDestLng() != null) {
            journey.setDestLng(request.getDestLng());
        }
        if (request.getTravelType() != null) {
            journey.setTravelType(request.getTravelType());
        }
        if (request.getVehicleType() != null) {
            journey.setVehicleType(request.getVehicleType());
        }
        if (request.getJourneyDate() != null) {
            journey.setJourneyDate(request.getJourneyDate());
        }
        if (request.getDistance() != null) {
            journey.setDistance(request.getDistance());
        }
        if (request.getDuration() != null && !request.getDuration().isBlank()) {
            journey.setDuration(request.getDuration());
        }
        if (request.getRoutePreferences() != null) {
            journey.setRoutePreferences(request.getRoutePreferences());
        }
        if (request.getRequiredFacilities() != null) {
            journey.setRequiredFacilities(request.getRequiredFacilities());
        }

        Journey updatedJourney = journeyRepository.save(journey);
        return mapToJourneyResponse(updatedJourney);
    }

    @Override
    @Transactional
    public void deleteJourney(Long userId, Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));

        if (!journey.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to delete this journey");
        }

        journeyRepository.delete(journey);
    }

    @Override
    public JourneyResponse mapToJourneyResponse(Journey journey) {
        List<RouteDTO> routeDTOs = new ArrayList<>();
        if (journey.getRoutes() != null && !journey.getRoutes().isEmpty()) {
            routeDTOs = journey.getRoutes().stream().map(route -> {
                List<List<Double>> geom = new ArrayList<>();
                try {
                    if (route.getGeometry() != null && !route.getGeometry().isBlank()) {
                        // Use List.class to parse dynamically and handle any Number types
                        List<?> rawList = objectMapper.readValue(route.getGeometry(), List.class);
                        for (Object obj : rawList) {
                            if (obj instanceof List) {
                                List<?> pt = (List<?>) obj;
                                if (pt.size() >= 2) {
                                    Double lat = ((Number) pt.get(0)).doubleValue();
                                    Double lng = ((Number) pt.get(1)).doubleValue();
                                    geom.add(List.of(lat, lng));
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    // Log the error so it's not silent
                    System.err.println("Error parsing geometry: " + e.getMessage());
                }

                List<FacilityDTO> facilitiesList = new ArrayList<>();
                try {
                    if (route.getFacilitiesData() != null && !route.getFacilitiesData().isBlank()) {
                        facilitiesList = objectMapper.readValue(route.getFacilitiesData(), new TypeReference<List<FacilityDTO>>() {});
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing facilities: " + e.getMessage());
                }

                // Sample real environmental conditions for this route (midpoint or destination)
                Double sampleLat = journey.getDestLat();
                Double sampleLng = journey.getDestLng();
                if (!geom.isEmpty()) {
                    List<Double> midPt = geom.get(geom.size() / 2);
                    sampleLat = midPt.get(0);
                    sampleLng = midPt.get(1);
                }

                WeatherDTO routeWeather = null;
                AirQualityDTO routeAQI = null;
                try {
                    if (sampleLat != null && sampleLng != null) {
                        routeWeather = weatherService.getWeather(sampleLat, sampleLng);
                        routeAQI = airQualityService.getAirQuality(sampleLat, sampleLng);
                    }
                } catch (Exception ex) {
                    // Non-blocking fallback
                }

                return RouteDTO.builder()
                        .routeId(route.getId())
                        .distance(route.getDistance())
                        .duration(route.getDuration())
                        .geometry(geom)
                        .summary(route.getSummary())
                        .profile(route.getProfile())
                        .facilities(facilitiesList)
                        .weather(routeWeather)
                        .airQuality(routeAQI)
                        .build();
            }).collect(Collectors.toList());
        }
        
        return JourneyResponse.builder()
                .id(journey.getId())
                .userId(journey.getUser().getId())
                .source(journey.getSource())
                .destination(journey.getDestination())
                .sourceLat(journey.getSourceLat())
                .sourceLng(journey.getSourceLng())
                .destLat(journey.getDestLat())
                .destLng(journey.getDestLng())
                .travelType(journey.getTravelType())
                .vehicleType(journey.getVehicleType())
                .journeyDate(journey.getJourneyDate())
                .status(journey.getStatus())
                .distance(journey.getDistance())
                .duration(journey.getDuration())
                .selectedRouteId(journey.getSelectedRouteId())
                .routePreferences(journey.getRoutePreferences())
                .requiredFacilities(journey.getRequiredFacilities())
                .routes(routeDTOs)
                .createdAt(journey.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public JourneyResponse regenerateRoutes(Long userId, Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));

        if (!journey.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to access this journey");
        }

        // Clear existing routes
        if (journey.getRoutes() != null) {
            routeRepository.deleteAll(journey.getRoutes());
            journey.getRoutes().clear();
        }

        List<RouteDTO> generatedRoutes = new ArrayList<>();
        if (journey.getSourceLat() != null && journey.getSourceLng() != null && journey.getDestLat() != null && journey.getDestLng() != null) {
            String profile = "driving-car";
            if (journey.getVehicleType() != null) {
                switch(journey.getVehicleType()) {
                    case BIKE: profile = "cycling-regular"; break;
                    case BUS: profile = "driving-hgv"; break;
                    case TRUCK: profile = "driving-hgv"; break;
                    case CAR:
                    case EV:
                    default: profile = "driving-car"; break;
                }
            }
            try {
                generatedRoutes = routingService.calculateRoutes(journey.getSourceLat(), journey.getSourceLng(), journey.getDestLat(), journey.getDestLng(), profile);
                List<Route> routesToSave = new ArrayList<>();
                for (RouteDTO dto : generatedRoutes) {
                    Route route = new Route();
                    route.setJourney(journey);
                    route.setDistance(dto.getDistance());
                    route.setDuration(dto.getDuration());
                    route.setProfile(dto.getProfile());
                    route.setSummary(dto.getSummary());
                    route.setGeometry(objectMapper.writeValueAsString(dto.getGeometry()));

                    List<FacilityDTO> allFacilities = new ArrayList<>();
                    if (dto.getGeometry() != null && !dto.getGeometry().isEmpty()) {
                        int size = dto.getGeometry().size();
                        int[] indices = {0, size / 2, size - 1};
                        for (int idx : indices) {
                            if (idx >= 0 && idx < size) {
                                List<Double> pt = dto.getGeometry().get(idx);
                                Double lat = pt.get(0);
                                Double lng = pt.get(1);
                                if (journey.getRequiredFacilities() != null && !journey.getRequiredFacilities().isEmpty()) {
                                    for (RequiredFacility facility : journey.getRequiredFacilities()) {
                                        allFacilities.addAll(nearbyFacilityService.getNearbyFacilities(lat, lng, facility.name(), 15.0));
                                    }
                                } else {
                                    allFacilities.addAll(nearbyFacilityService.getNearbyFacilities(lat, lng, "ALL", 15.0));
                                }
                            }
                        }
                    }
                    List<FacilityDTO> uniqueFacilities = new ArrayList<>();
                    for (FacilityDTO f : allFacilities) {
                        boolean exists = uniqueFacilities.stream().anyMatch(e -> 
                            e.getName() != null && e.getName().equals(f.getName()) && 
                            e.getLatitude() != null && e.getLatitude().equals(f.getLatitude())
                        );
                        if (!exists) {
                            uniqueFacilities.add(f);
                        }
                    }
                    route.setFacilitiesData(objectMapper.writeValueAsString(uniqueFacilities));
                    routesToSave.add(route);
                }
                List<Route> savedRoutes = routeRepository.saveAll(routesToSave);
                journey.setRoutes(savedRoutes);
                journey.setSelectedRouteId(null);
            } catch (Exception ex) {
                // Ignore
            }
        }

        Journey updatedJourney = journeyRepository.save(journey);
        return mapToJourneyResponse(updatedJourney);
    }

    @Override
    @Transactional
    public JourneyResponse selectRoute(Long userId, Long journeyId, Long routeId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));

        if (!journey.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to modify this journey");
        }

        boolean routeExists = journey.getRoutes() != null && journey.getRoutes().stream().anyMatch(r -> r.getId().equals(routeId));
        if (!routeExists) {
            throw new ResourceNotFoundException("Route not found for this journey");
        }

        journey.setSelectedRouteId(routeId);
        Journey updatedJourney = journeyRepository.save(journey);
        return mapToJourneyResponse(updatedJourney);
    }
}
