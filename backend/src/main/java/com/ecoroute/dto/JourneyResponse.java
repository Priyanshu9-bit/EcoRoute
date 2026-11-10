package com.ecoroute.dto;

import com.ecoroute.entity.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;

public class JourneyResponse {
    private Long id;
    private Long userId;
    private String source;
    private String destination;
    private Double sourceLat;
    private Double sourceLng;
    private Double destLat;
    private Double destLng;
    private TravelType travelType;
    private VehicleType vehicleType;
    private LocalDateTime journeyDate;
    private JourneyStatus status;
    private Double distance;
    private String duration;
    private Long selectedRouteId;
    private Set<RoutePreference> routePreferences;
    private Set<RequiredFacility> requiredFacilities;
    private List<RouteDTO> routes;
    private LocalDateTime createdAt;

    public JourneyResponse() {
    }

    public JourneyResponse(Long id, Long userId, String source, String destination, Double sourceLat, Double sourceLng, Double destLat, Double destLng, TravelType travelType, VehicleType vehicleType, LocalDateTime journeyDate, JourneyStatus status, Double distance, String duration, Long selectedRouteId, Set<RoutePreference> routePreferences, Set<RequiredFacility> requiredFacilities, List<RouteDTO> routes, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.source = source;
        this.destination = destination;
        this.sourceLat = sourceLat;
        this.sourceLng = sourceLng;
        this.destLat = destLat;
        this.destLng = destLng;
        this.travelType = travelType;
        this.vehicleType = vehicleType;
        this.journeyDate = journeyDate;
        this.status = status;
        this.distance = distance;
        this.duration = duration;
        this.selectedRouteId = selectedRouteId;
        this.routePreferences = routePreferences;
        this.requiredFacilities = requiredFacilities;
        this.routes = routes;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public JourneyStatus getStatus() { return status; }
    public void setStatus(JourneyStatus status) { this.status = status; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Long getSelectedRouteId() { return selectedRouteId; }
    public void setSelectedRouteId(Long selectedRouteId) { this.selectedRouteId = selectedRouteId; }

    public Set<RoutePreference> getRoutePreferences() { return routePreferences; }
    public void setRoutePreferences(Set<RoutePreference> routePreferences) { this.routePreferences = routePreferences; }

    public Set<RequiredFacility> getRequiredFacilities() { return requiredFacilities; }
    public void setRequiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; }

    public List<RouteDTO> getRoutes() { return routes; }
    public void setRoutes(List<RouteDTO> routes) { this.routes = routes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static JourneyResponseBuilder builder() {
        return new JourneyResponseBuilder();
    }

    public static class JourneyResponseBuilder {
        private Long id;
        private Long userId;
        private String source;
        private String destination;
        private Double sourceLat;
        private Double sourceLng;
        private Double destLat;
        private Double destLng;
        private TravelType travelType;
        private VehicleType vehicleType;
        private LocalDateTime journeyDate;
        private JourneyStatus status;
        private Double distance;
        private String duration;
        private Long selectedRouteId;
        private Set<RoutePreference> routePreferences;
        private Set<RequiredFacility> requiredFacilities;
        private List<RouteDTO> routes;
        private LocalDateTime createdAt;

        public JourneyResponseBuilder id(Long id) { this.id = id; return this; }
        public JourneyResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public JourneyResponseBuilder source(String source) { this.source = source; return this; }
        public JourneyResponseBuilder destination(String destination) { this.destination = destination; return this; }
        public JourneyResponseBuilder sourceLat(Double sourceLat) { this.sourceLat = sourceLat; return this; }
        public JourneyResponseBuilder sourceLng(Double sourceLng) { this.sourceLng = sourceLng; return this; }
        public JourneyResponseBuilder destLat(Double destLat) { this.destLat = destLat; return this; }
        public JourneyResponseBuilder destLng(Double destLng) { this.destLng = destLng; return this; }
        public JourneyResponseBuilder travelType(TravelType travelType) { this.travelType = travelType; return this; }
        public JourneyResponseBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }
        public JourneyResponseBuilder journeyDate(LocalDateTime journeyDate) { this.journeyDate = journeyDate; return this; }
        public JourneyResponseBuilder status(JourneyStatus status) { this.status = status; return this; }
        public JourneyResponseBuilder distance(Double distance) { this.distance = distance; return this; }
        public JourneyResponseBuilder duration(String duration) { this.duration = duration; return this; }
        public JourneyResponseBuilder selectedRouteId(Long selectedRouteId) { this.selectedRouteId = selectedRouteId; return this; }
        public JourneyResponseBuilder routePreferences(Set<RoutePreference> routePreferences) { this.routePreferences = routePreferences; return this; }
        public JourneyResponseBuilder requiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; return this; }
        public JourneyResponseBuilder routes(List<RouteDTO> routes) { this.routes = routes; return this; }
        public JourneyResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public JourneyResponse build() {
            return new JourneyResponse(id, userId, source, destination, sourceLat, sourceLng, destLat, destLng, travelType, vehicleType, journeyDate, status, distance, duration, selectedRouteId, routePreferences, requiredFacilities, routes, createdAt);
        }
    }
}
