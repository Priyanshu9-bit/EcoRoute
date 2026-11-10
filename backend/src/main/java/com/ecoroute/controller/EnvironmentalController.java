package com.ecoroute.controller;

import com.ecoroute.dto.AirQualityDTO;
import com.ecoroute.dto.ApiResponse;
import com.ecoroute.dto.WeatherDTO;
import com.ecoroute.service.AirQualityService;
import com.ecoroute.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EnvironmentalController {

    private final WeatherService weatherService;
    private final AirQualityService airQualityService;

    public EnvironmentalController(WeatherService weatherService, AirQualityService airQualityService) {
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
    }

    @GetMapping("/weather")
    public ResponseEntity<ApiResponse<WeatherDTO>> getWeather(
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon) {
        WeatherDTO weather = weatherService.getWeather(lat, lon);
        return ResponseEntity.ok(ApiResponse.success("Weather data retrieved successfully", weather));
    }

    @GetMapping("/air-quality")
    public ResponseEntity<ApiResponse<AirQualityDTO>> getAirQuality(
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon) {
        AirQualityDTO airQuality = airQualityService.getAirQuality(lat, lon);
        return ResponseEntity.ok(ApiResponse.success("Air quality data retrieved successfully", airQuality));
    }
}
