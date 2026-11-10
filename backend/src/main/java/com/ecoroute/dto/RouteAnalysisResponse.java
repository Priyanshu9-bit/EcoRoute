package com.ecoroute.dto;

import java.util.List;

public class RouteAnalysisResponse {
    private RouteDTO route;
    private WeatherDTO sourceWeather;
    private WeatherDTO destinationWeather;
    private AirQualityDTO sourceAirQuality;
    private AirQualityDTO destinationAirQuality;
    private List<FacilityDTO> nearbyFacilities;

    public RouteAnalysisResponse() {
    }

    public RouteAnalysisResponse(RouteDTO route, WeatherDTO sourceWeather, WeatherDTO destinationWeather, AirQualityDTO sourceAirQuality, AirQualityDTO destinationAirQuality, List<FacilityDTO> nearbyFacilities) {
        this.route = route;
        this.sourceWeather = sourceWeather;
        this.destinationWeather = destinationWeather;
        this.sourceAirQuality = sourceAirQuality;
        this.destinationAirQuality = destinationAirQuality;
        this.nearbyFacilities = nearbyFacilities;
    }

    public RouteDTO getRoute() { return route; }
    public void setRoute(RouteDTO route) { this.route = route; }

    public WeatherDTO getSourceWeather() { return sourceWeather; }
    public void setSourceWeather(WeatherDTO sourceWeather) { this.sourceWeather = sourceWeather; }

    public WeatherDTO getDestinationWeather() { return destinationWeather; }
    public void setDestinationWeather(WeatherDTO destinationWeather) { this.destinationWeather = destinationWeather; }

    public AirQualityDTO getSourceAirQuality() { return sourceAirQuality; }
    public void setSourceAirQuality(AirQualityDTO sourceAirQuality) { this.sourceAirQuality = sourceAirQuality; }

    public AirQualityDTO getDestinationAirQuality() { return destinationAirQuality; }
    public void setDestinationAirQuality(AirQualityDTO destinationAirQuality) { this.destinationAirQuality = destinationAirQuality; }

    public List<FacilityDTO> getNearbyFacilities() { return nearbyFacilities; }
    public void setNearbyFacilities(List<FacilityDTO> nearbyFacilities) { this.nearbyFacilities = nearbyFacilities; }

    public static RouteAnalysisResponseBuilder builder() {
        return new RouteAnalysisResponseBuilder();
    }

    public static class RouteAnalysisResponseBuilder {
        private RouteDTO route;
        private WeatherDTO sourceWeather;
        private WeatherDTO destinationWeather;
        private AirQualityDTO sourceAirQuality;
        private AirQualityDTO destinationAirQuality;
        private List<FacilityDTO> nearbyFacilities;

        public RouteAnalysisResponseBuilder route(RouteDTO route) { this.route = route; return this; }
        public RouteAnalysisResponseBuilder sourceWeather(WeatherDTO sourceWeather) { this.sourceWeather = sourceWeather; return this; }
        public RouteAnalysisResponseBuilder destinationWeather(WeatherDTO destinationWeather) { this.destinationWeather = destinationWeather; return this; }
        public RouteAnalysisResponseBuilder sourceAirQuality(AirQualityDTO sourceAirQuality) { this.sourceAirQuality = sourceAirQuality; return this; }
        public RouteAnalysisResponseBuilder destinationAirQuality(AirQualityDTO destinationAirQuality) { this.destinationAirQuality = destinationAirQuality; return this; }
        public RouteAnalysisResponseBuilder nearbyFacilities(List<FacilityDTO> nearbyFacilities) { this.nearbyFacilities = nearbyFacilities; return this; }

        public RouteAnalysisResponse build() {
            return new RouteAnalysisResponse(route, sourceWeather, destinationWeather, sourceAirQuality, destinationAirQuality, nearbyFacilities);
        }
    }
}
