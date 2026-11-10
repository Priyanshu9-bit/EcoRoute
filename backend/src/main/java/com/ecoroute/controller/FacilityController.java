package com.ecoroute.controller;

import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.FacilityDTO;
import com.ecoroute.service.NearbyFacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FacilityController {

    private final NearbyFacilityService nearbyFacilityService;

    public FacilityController(NearbyFacilityService nearbyFacilityService) {
        this.nearbyFacilityService = nearbyFacilityService;
    }

    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getFacilities(
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon,
            @RequestParam(value = "type", required = false, defaultValue = "ALL") String type,
            @RequestParam(value = "radius", required = false, defaultValue = "5.0") Double radius) {
        List<FacilityDTO> facilities = nearbyFacilityService.getNearbyFacilities(lat, lon, type, radius);
        return ResponseEntity.ok(ApiResponse.success("Nearby facilities retrieved successfully", facilities));
    }
}
