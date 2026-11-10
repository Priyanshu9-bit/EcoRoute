package com.ecoroute.service;

import com.ecoroute.dto.FacilityDTO;

import java.util.List;

public interface NearbyFacilityService {
    List<FacilityDTO> getNearbyFacilities(Double latitude, Double longitude, String facilityType, Double radiusKm);
}
