package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.JourneyRequest;
import com.ecoroute.dto.JourneyResponse;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.JourneyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JourneyResponse>> createJourney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody JourneyRequest journeyRequest) {
        JourneyResponse journey = journeyService.createJourney(userPrincipal.getId(), journeyRequest);
        return new ResponseEntity<>(ApiResponse.success("Journey planned and created successfully", journey), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JourneyResponse>>> getUserJourneys(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JourneyResponse> journeys = journeyService.getUserJourneys(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Journeys retrieved successfully", journeys));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JourneyResponse>> getJourneyById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long journeyId) {
        JourneyResponse journey = journeyService.getJourneyById(userPrincipal.getId(), journeyId);
        return ResponseEntity.ok(ApiResponse.success("Journey details retrieved successfully", journey));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JourneyResponse>> updateJourney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long journeyId,
            @RequestBody JourneyRequest journeyRequest) {
        JourneyResponse journey = journeyService.updateJourney(userPrincipal.getId(), journeyId, journeyRequest);
        return ResponseEntity.ok(ApiResponse.success("Journey updated successfully", journey));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJourney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long journeyId) {
        journeyService.deleteJourney(userPrincipal.getId(), journeyId);
        return ResponseEntity.ok(ApiResponse.success("Journey deleted successfully"));
    }
}
