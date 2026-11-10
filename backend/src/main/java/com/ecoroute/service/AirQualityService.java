package com.ecoroute.service;

import com.ecoroute.dto.AirQualityDTO;

public interface AirQualityService {
    AirQualityDTO getAirQuality(Double latitude, Double longitude);
}
