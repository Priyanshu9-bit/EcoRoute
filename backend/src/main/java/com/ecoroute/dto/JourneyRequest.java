package com.ecoroute.dto;

import com.ecoroute.entity.RequiredFacility;
import com.ecoroute.entity.RoutePreference;
import com.ecoroute.entity.TravelType;
import com.ecoroute.entity.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;

public class JourneyRequest {

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Travel type is required")
    private TravelType travelType;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    private Double sourceLat;
    private Double sourceLng;
    private Double destLat;
    private Double destLng;

    private LocalDateTime journeyDate;

    private Double distance;

    private String duration;

    private Set<RoutePreference> routePreferences;

    private Set<RequiredFacility> requiredFacilities;

    public JourneyRequest() {
    }

    public JourneyRequest(String source, String destination, Double sourceLat, Double sourceLng, Double destLat, Double destLng, TravelType travelType, VehicleType vehicleType, LocalDateTime journeyDate, Double distance, String duration, Set<RoutePreference> routePreferences, Set<RequiredFacility> requiredFacilities) {
        this.source = source;
        this.destination = destination;
        this.sourceLat = sourceLat;
        this.sourceLng = sourceLng;
        this.destLat = destLat;
        this.destLng = destLng;
        this.travelType = travelType;
        this.vehicleType = vehicleType;
        this.journeyDate = journeyDate;
        this.distance = distance;
        this.duration = duration;
        this.routePreferences = routePreferences;
        this.requiredFacilities = requiredFacilities;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getSourceLat() { return sourceLat; }
    public void setSourceLat(Double sourceLat) { this.sourceLat = sourceLat; }

    public Double getSourceLng() { return sourceLng; }
    public void setSourceLng(Double sourceLng) { this.sourceLng = sourceLng; }

    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public TravelType getTravelType() { return travelType; }
    public void setTravelType(TravelType travelType) { this.travelType = travelType; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public LocalDateTime getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDateTime journeyDate) { this.journeyDate = journeyDate; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Set<RoutePreference> getRoutePreferences() { return routePreferences; }
    public void setRoutePreferences(Set<RoutePreference> routePreferences) { this.routePreferences = routePreferences; }

    public Set<RequiredFacility> getRequiredFacilities() { return requiredFacilities; }
    public void setRequiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; }

    public static JourneyRequestBuilder builder() {
        return new JourneyRequestBuilder();
    }

    public static class JourneyRequestBuilder {
        private String source;
        private String destination;
        private Double sourceLat;
        private Double sourceLng;
        private Double destLat;
        private Double destLng;
        private TravelType travelType;
        private VehicleType vehicleType;
        private LocalDateTime journeyDate;
        private Double distance;
        private String duration;
        private Set<RoutePreference> routePreferences;
        private Set<RequiredFacility> requiredFacilities;

        public JourneyRequestBuilder source(String source) { this.source = source; return this; }
        public JourneyRequestBuilder destination(String destination) { this.destination = destination; return this; }
        public JourneyRequestBuilder sourceLat(Double sourceLat) { this.sourceLat = sourceLat; return this; }
        public JourneyRequestBuilder sourceLng(Double sourceLng) { this.sourceLng = sourceLng; return this; }
        public JourneyRequestBuilder destLat(Double destLat) { this.destLat = destLat; return this; }
        public JourneyRequestBuilder destLng(Double destLng) { this.destLng = destLng; return this; }
        public JourneyRequestBuilder travelType(TravelType travelType) { this.travelType = travelType; return this; }
        public JourneyRequestBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }
        public JourneyRequestBuilder journeyDate(LocalDateTime journeyDate) { this.journeyDate = journeyDate; return this; }
        public JourneyRequestBuilder distance(Double distance) { this.distance = distance; return this; }
        public JourneyRequestBuilder duration(String duration) { this.duration = duration; return this; }
        public JourneyRequestBuilder routePreferences(Set<RoutePreference> routePreferences) { this.routePreferences = routePreferences; return this; }
        public JourneyRequestBuilder requiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; return this; }

        public JourneyRequest build() {
            return new JourneyRequest(source, destination, sourceLat, sourceLng, destLat, destLng, travelType, vehicleType, journeyDate, distance, duration, routePreferences, requiredFacilities);
        }
    }
}
