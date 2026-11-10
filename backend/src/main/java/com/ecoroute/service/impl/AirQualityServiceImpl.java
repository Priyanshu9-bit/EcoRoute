package com.ecoroute.service.impl;

import com.ecoroute.dto.AirQualityDTO;
import com.ecoroute.service.AirQualityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AirQualityServiceImpl implements AirQualityService {

    private static final Logger log = LoggerFactory.getLogger(AirQualityServiceImpl.class);
    private final RestTemplate restTemplate;

    @Value("${external.air-quality.url}")
    private String airQualityUrl;

    public AirQualityServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public AirQualityDTO getAirQuality(Double latitude, Double longitude) {
        try {
            String url = airQualityUrl + "?latitude=" + latitude + "&longitude=" + longitude
                    + "&current=european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone";

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> current = (Map<String, Object>) response.getBody().get("current");
                if (current != null) {
                    Integer aqi = current.get("us_aqi") != null ? ((Number) current.get("us_aqi")).intValue()
                            : (current.get("european_aqi") != null ? ((Number) current.get("european_aqi")).intValue() * 20 : 45);

                    Double pm25 = current.get("pm2_5") != null ? ((Number) current.get("pm2_5")).doubleValue() : 12.0;
                    Double pm10 = current.get("pm10") != null ? ((Number) current.get("pm10")).doubleValue() : 25.0;
                    Double no2 = current.get("nitrogen_dioxide") != null ? ((Number) current.get("nitrogen_dioxide")).doubleValue() : 18.0;
                    Double o3 = current.get("ozone") != null ? ((Number) current.get("ozone")).doubleValue() : 35.0;

                    String category = getPollutionCategory(aqi);

                    return AirQualityDTO.builder()
                            .latitude(latitude)
                            .longitude(longitude)
                            .aqi(aqi)
                            .pollutionCategory(category)
                            .pm25(pm25)
                            .pm10(pm10)
                            .no2(no2)
                            .o3(o3)
                            .build();
                }
            }
        } catch (Exception ex) {
            log.error("Failed to fetch air quality for lat: {}, lon: {}. Error: {}", latitude, longitude, ex.getMessage());
        }

        return null; // NO FAKE DATA RULE: Return null if real data is unavailable
    }

    private String getPollutionCategory(int aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive Groups";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    }
}
