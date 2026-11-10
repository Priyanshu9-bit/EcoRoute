package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.JourneyResponse;
import com.ecoroute.dto.RouteDTO;
import com.ecoroute.dto.SelectRouteRequest;
import com.ecoroute.service.JourneyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.ecoroute.security.UserPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journeys")
public class JourneyRouteController {

    private final JourneyService journeyService;

    public JourneyRouteController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @GetMapping("/{journeyId}/routes")
    public ResponseEntity<ApiResponse<JourneyResponse>> getRoutes(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("journeyId") Long journeyId) {
        Long userId = userPrincipal.getId();
        JourneyResponse journey = journeyService.getJourneyById(userId, journeyId);
        return ResponseEntity.ok(ApiResponse.success("Journey retrieved successfully", journey));
    }

    @PostMapping("/{journeyId}/routes")
    public ResponseEntity<ApiResponse<JourneyResponse>> regenerateRoutes(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("journeyId") Long journeyId) {
        Long userId = userPrincipal.getId();
        JourneyResponse journey = journeyService.regenerateRoutes(userId, journeyId);
        return ResponseEntity.ok(ApiResponse.success("Routes regenerated successfully", journey));
    }

    @PutMapping("/{journeyId}/selected-route")
    public ResponseEntity<ApiResponse<JourneyResponse>> selectRoute(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("journeyId") Long journeyId,
            @Valid @RequestBody SelectRouteRequest request) {
        Long userId = userPrincipal.getId();
        JourneyResponse journey = journeyService.selectRoute(userId, journeyId, request.getRouteId());
        return ResponseEntity.ok(ApiResponse.success("Route selected successfully", journey));
    }
}
