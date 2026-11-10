package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.RoadReportRequest;
import com.ecoroute.dto.RoadReportResponse;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.RoadReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/road-reports")
public class RoadReportController {

    private final RoadReportService roadReportService;

    public RoadReportController(RoadReportService roadReportService) {
        this.roadReportService = roadReportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoadReportResponse>> createReport(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody RoadReportRequest request) {
        RoadReportResponse response = roadReportService.createReport(userPrincipal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Road report submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<RoadReportResponse>>> getUserReports(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RoadReportResponse> reports = roadReportService.getUserReports(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("User road reports retrieved successfully", reports));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoadReportResponse>>> getAllReports() {
        List<RoadReportResponse> reports = roadReportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.success("All road reports retrieved successfully", reports));
    }
}
