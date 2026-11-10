package com.ecoroute.service;

import com.ecoroute.dto.WeatherDTO;

public interface WeatherService {
    WeatherDTO getWeather(Double latitude, Double longitude);
}
