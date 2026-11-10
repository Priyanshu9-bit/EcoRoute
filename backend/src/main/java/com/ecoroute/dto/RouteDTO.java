package com.ecoroute.dto;

import java.util.List;
import java.util.ArrayList;

public class RouteDTO {
    private Long routeId;
    private Double distance;
    private Double duration;
    private List<List<Double>> geometry;
    private String summary;
    private String profile;
    private List<FacilityDTO> facilities = new ArrayList<>();
    private WeatherDTO weather;
    private AirQualityDTO airQuality;

    public RouteDTO() {
    }

    public RouteDTO(Long routeId, Double distance, Double duration, List<List<Double>> geometry, String summary, String profile, List<FacilityDTO> facilities, WeatherDTO weather, AirQualityDTO airQuality) {
        this.routeId = routeId;
        this.distance = distance;
        this.duration = duration;
        this.geometry = geometry;
        this.summary = summary;
        this.profile = profile;
        this.facilities = facilities != null ? facilities : new ArrayList<>();
        this.weather = weather;
        this.airQuality = airQuality;
    }

    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public List<List<Double>> getGeometry() { return geometry; }
    public void setGeometry(List<List<Double>> geometry) { this.geometry = geometry; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getProfile() { return profile; }
    public void setProfile(String profile) { this.profile = profile; }

    public List<FacilityDTO> getFacilities() { return facilities; }
    public void setFacilities(List<FacilityDTO> facilities) { this.facilities = facilities; }

    public WeatherDTO getWeather() { return weather; }
    public void setWeather(WeatherDTO weather) { this.weather = weather; }

    public AirQualityDTO getAirQuality() { return airQuality; }
    public void setAirQuality(AirQualityDTO airQuality) { this.airQuality = airQuality; }

    public static RouteDTOBuilder builder() {
        return new RouteDTOBuilder();
    }

    public static class RouteDTOBuilder {
        private Long routeId;
        private Double distance;
        private Double duration;
        private List<List<Double>> geometry;
        private String summary;
        private String profile;
        private List<FacilityDTO> facilities = new ArrayList<>();
        private WeatherDTO weather;
        private AirQualityDTO airQuality;

        public RouteDTOBuilder routeId(Long routeId) { this.routeId = routeId; return this; }
        public RouteDTOBuilder distance(Double distance) { this.distance = distance; return this; }
        public RouteDTOBuilder duration(Double duration) { this.duration = duration; return this; }
        public RouteDTOBuilder geometry(List<List<Double>> geometry) { this.geometry = geometry; return this; }
        public RouteDTOBuilder summary(String summary) { this.summary = summary; return this; }
        public RouteDTOBuilder profile(String profile) { this.profile = profile; return this; }
        public RouteDTOBuilder facilities(List<FacilityDTO> facilities) { this.facilities = facilities; return this; }
        public RouteDTOBuilder weather(WeatherDTO weather) { this.weather = weather; return this; }
        public RouteDTOBuilder airQuality(AirQualityDTO airQuality) { this.airQuality = airQuality; return this; }

        public RouteDTO build() {
            return new RouteDTO(routeId, distance, duration, geometry, summary, profile, facilities, weather, airQuality);
        }
    }
}
