package com.ecoroute.service.impl;

import com.ecoroute.dto.*;
import com.ecoroute.entity.RequiredFacility;
import com.ecoroute.service.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteAnalysisServiceImpl implements RouteAnalysisService {

    private final RoutingService routingService;
    private final WeatherService weatherService;
    private final AirQualityService airQualityService;
    private final NearbyFacilityService nearbyFacilityService;

    public RouteAnalysisServiceImpl(RoutingService routingService, WeatherService weatherService, AirQualityService airQualityService, NearbyFacilityService nearbyFacilityService) {
        this.routingService = routingService;
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
        this.nearbyFacilityService = nearbyFacilityService;
    }

    @Override
    public RouteAnalysisResponse analyzeRoute(RouteAnalysisRequest request) {
        List<RouteDTO> routes = routingService.calculateRoutes(
                request.getSourceLat(),
                request.getSourceLng(),
                request.getDestLat(),
                request.getDestLng(),
                "driving-car"
        );
        RouteDTO route = routes.isEmpty() ? null : routes.get(0);

        WeatherDTO sourceWeather = weatherService.getWeather(request.getSourceLat(), request.getSourceLng());
        WeatherDTO destWeather = weatherService.getWeather(request.getDestLat(), request.getDestLng());

        AirQualityDTO sourceAQI = airQualityService.getAirQuality(request.getSourceLat(), request.getSourceLng());
        AirQualityDTO destAQI = airQualityService.getAirQuality(request.getDestLat(), request.getDestLng());

        List<FacilityDTO> facilities = new ArrayList<>();
        if (request.getRequiredFacilities() != null && !request.getRequiredFacilities().isEmpty()) {
            for (RequiredFacility facility : request.getRequiredFacilities()) {
                facilities.addAll(nearbyFacilityService.getNearbyFacilities(
                        request.getDestLat(),
                        request.getDestLng(),
                        facility.name(),
                        5.0
                ));
            }
        } else {
            facilities.addAll(nearbyFacilityService.getNearbyFacilities(
                    request.getDestLat(),
                    request.getDestLng(),
                    "ALL",
                    5.0
            ));
        }

        return RouteAnalysisResponse.builder()
                .route(route)
                .sourceWeather(sourceWeather)
                .destinationWeather(destWeather)
                .sourceAirQuality(sourceAQI)
                .destinationAirQuality(destAQI)
                .nearbyFacilities(facilities)
                .build();
    }
}
