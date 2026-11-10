package com.ecoroute.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "journeys")
public class Journey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(name = "source_lat")
    private Double sourceLat;

    @Column(name = "source_lng")
    private Double sourceLng;

    @Column(name = "dest_lat")
    private Double destLat;

    @Column(name = "dest_lng")
    private Double destLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_type", nullable = false)
    private TravelType travelType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;

    @Column(name = "journey_date", nullable = false)
    private LocalDateTime journeyDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JourneyStatus status;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "duration")
    private String duration;

    @Column(name = "selected_route_id")
    private Long selectedRouteId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "journey_route_preferences", joinColumns = @JoinColumn(name = "journey_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "preference")
    private Set<RoutePreference> routePreferences = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "journey_required_facilities", joinColumns = @JoinColumn(name = "journey_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "facility")
    private Set<RequiredFacility> requiredFacilities = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "journey", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Route> routes;

    public Journey() {
    }

    public Journey(Long id, User user, String source, String destination, Double sourceLat, Double sourceLng, Double destLat, Double destLng, TravelType travelType, VehicleType vehicleType, LocalDateTime journeyDate, JourneyStatus status, Double distance, String duration, Long selectedRouteId, Set<RoutePreference> routePreferences, Set<RequiredFacility> requiredFacilities, List<Route> routes, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
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
        this.routePreferences = routePreferences != null ? routePreferences : new HashSet<>();
        this.requiredFacilities = requiredFacilities != null ? requiredFacilities : new HashSet<>();
        this.routes = routes != null ? routes : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public List<Route> getRoutes() { return routes; }
    public void setRoutes(List<Route> routes) { this.routes = routes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static JourneyBuilder builder() {
        return new JourneyBuilder();
    }

    public static class JourneyBuilder {
        private Long id;
        private User user;
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
        private Set<RoutePreference> routePreferences = new HashSet<>();
        private Set<RequiredFacility> requiredFacilities = new HashSet<>();
        private List<Route> routes = new ArrayList<>();
        private LocalDateTime createdAt;

        public JourneyBuilder id(Long id) { this.id = id; return this; }
        public JourneyBuilder user(User user) { this.user = user; return this; }
        public JourneyBuilder source(String source) { this.source = source; return this; }
        public JourneyBuilder destination(String destination) { this.destination = destination; return this; }
        public JourneyBuilder sourceLat(Double sourceLat) { this.sourceLat = sourceLat; return this; }
        public JourneyBuilder sourceLng(Double sourceLng) { this.sourceLng = sourceLng; return this; }
        public JourneyBuilder destLat(Double destLat) { this.destLat = destLat; return this; }
        public JourneyBuilder destLng(Double destLng) { this.destLng = destLng; return this; }
        public JourneyBuilder travelType(TravelType travelType) { this.travelType = travelType; return this; }
        public JourneyBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }
        public JourneyBuilder journeyDate(LocalDateTime journeyDate) { this.journeyDate = journeyDate; return this; }
        public JourneyBuilder status(JourneyStatus status) { this.status = status; return this; }
        public JourneyBuilder distance(Double distance) { this.distance = distance; return this; }
        public JourneyBuilder duration(String duration) { this.duration = duration; return this; }
        public JourneyBuilder selectedRouteId(Long selectedRouteId) { this.selectedRouteId = selectedRouteId; return this; }
        public JourneyBuilder routePreferences(Set<RoutePreference> routePreferences) { this.routePreferences = routePreferences; return this; }
        public JourneyBuilder requiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; return this; }
        public JourneyBuilder routes(List<Route> routes) { this.routes = routes; return this; }
        public JourneyBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Journey build() {
            return new Journey(id, user, source, destination, sourceLat, sourceLng, destLat, destLng, travelType, vehicleType, journeyDate, status, distance, duration, selectedRouteId, routePreferences, requiredFacilities, routes, createdAt);
        }
    }
}
