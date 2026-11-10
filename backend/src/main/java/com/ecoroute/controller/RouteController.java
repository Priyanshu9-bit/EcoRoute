package com.ecoroute.controller;

import com.ecoroute.dto.*;
import com.ecoroute.service.LocationService;
import com.ecoroute.service.RouteAnalysisService;
import com.ecoroute.service.RoutingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RouteController {

    private final RoutingService routingService;
    private final LocationService locationService;
    private final RouteAnalysisService routeAnalysisService;

    public RouteController(RoutingService routingService, LocationService locationService, RouteAnalysisService routeAnalysisService) {
        this.routingService = routingService;
        this.locationService = locationService;
        this.routeAnalysisService = routeAnalysisService;
    }

    @PostMapping("/routes/search")
    public ResponseEntity<ApiResponse<RouteDTO>> searchRoute(@Valid @RequestBody RouteSearchRequest request) {
        java.util.List<RouteDTO> routes = routingService.calculateRoutes(request);
        RouteDTO route = routes.isEmpty() ? null : routes.get(0);
        return ResponseEntity.ok(ApiResponse.success("Route calculated successfully", route));
    }

    @PostMapping("/routes/analyze")
    public ResponseEntity<ApiResponse<RouteAnalysisResponse>> analyzeRoute(@Valid @RequestBody RouteAnalysisRequest request) {
        RouteAnalysisResponse analysis = routeAnalysisService.analyzeRoute(request);
        return ResponseEntity.ok(ApiResponse.success("Route environmental analysis completed", analysis));
    }

    @GetMapping("/location/geocode")
    public ResponseEntity<ApiResponse<GeocodeResponse>> geocode(@RequestParam("query") String query) {
        GeocodeResponse location = locationService.geocode(query);
        return ResponseEntity.ok(ApiResponse.success("Location geocoded successfully", location));
    }

    @GetMapping("/location/reverse")
    public ResponseEntity<ApiResponse<GeocodeResponse>> reverseGeocode(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {
        GeocodeResponse location = locationService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Location reverse-geocoded successfully", location));
    }
}
