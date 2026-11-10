package com.ecoroute.service.impl;

import com.ecoroute.dto.WeatherDTO;
import com.ecoroute.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherServiceImpl implements WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherServiceImpl.class);
    private final RestTemplate restTemplate;

    @Value("${external.weather.url}")
    private String openMeteoUrl;

    public WeatherServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public WeatherDTO getWeather(Double latitude, Double longitude) {
        try {
            String url = openMeteoUrl + "?latitude=" + latitude + "&longitude=" + longitude
                    + "&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m";

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> current = (Map<String, Object>) response.getBody().get("current");
                if (current != null) {
                    Double temp = ((Number) current.get("temperature_2m")).doubleValue();
                    Double humidity = ((Number) current.get("relative_humidity_2m")).doubleValue();
                    Double rain = ((Number) current.get("rain")).doubleValue();
                    Double windSpeed = ((Number) current.get("wind_speed_10m")).doubleValue();
                    int weatherCode = ((Number) current.get("weather_code")).intValue();

                    String condition = interpretWmoWeatherCode(weatherCode);

                    return WeatherDTO.builder()
                            .latitude(latitude)
                            .longitude(longitude)
                            .temperature(temp)
                            .humidity(humidity)
                            .rain(rain)
                            .windSpeed(windSpeed)
                            .weatherCondition(condition)
                            .build();
                }
            }
        } catch (Exception ex) {
            log.error("Failed to fetch live weather from Open-Meteo for lat: {}, lon: {}. Error: {}", latitude, longitude, ex.getMessage());
        }

        return null; // NO FAKE DATA RULE: Return null if real data is unavailable
    }

    private String interpretWmoWeatherCode(int code) {
        return switch (code) {
            case 0 -> "Clear sky";
            case 1, 2, 3 -> "Mainly clear / Partly cloudy";
            case 45, 48 -> "Foggy";
            case 51, 53, 55 -> "Drizzle";
            case 61, 63, 65 -> "Rain";
            case 71, 73, 75 -> "Snow fall";
            case 80, 81, 82 -> "Rain showers";
            case 95, 96, 99 -> "Thunderstorm";
            default -> "Fair";
        };
    }
}
