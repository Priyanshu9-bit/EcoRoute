package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.SavedRouteRequest;
import com.ecoroute.dto.SavedRouteResponse;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.SavedRouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-routes")
public class SavedRouteController {

    private final SavedRouteService savedRouteService;

    public SavedRouteController(SavedRouteService savedRouteService) {
        this.savedRouteService = savedRouteService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavedRouteResponse>> saveRoute(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SavedRouteRequest request) {
        SavedRouteResponse response = savedRouteService.saveRoute(userPrincipal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Route saved successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedRouteResponse>>> getSavedRoutes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SavedRouteResponse> routes = savedRouteService.getUserSavedRoutes(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved routes retrieved successfully", routes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSavedRoute(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long routeId) {
        savedRouteService.deleteSavedRoute(userPrincipal.getId(), routeId);
        return ResponseEntity.ok(ApiResponse.success("Saved route deleted successfully"));
    }
}
