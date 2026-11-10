package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.DashboardResponse;
import com.ecoroute.security.UserPrincipal;
import com.ecoroute.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardResponse dashboardData = dashboardService.getDashboardData(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", dashboardData));
    }
}
