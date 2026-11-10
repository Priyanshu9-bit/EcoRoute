package com.ecoroute.dto;

import com.ecoroute.entity.VehicleType;
import java.time.LocalDateTime;

public class SavedRouteResponse {
    private Long id;
    private String source;
    private String destination;
    private VehicleType vehicleType;
    private String distance;
    private LocalDateTime createdAt;

    public SavedRouteResponse() {
    }

    public SavedRouteResponse(Long id, String source, String destination, VehicleType vehicleType, String distance, LocalDateTime createdAt) {
        this.id = id;
        this.source = source;
        this.destination = destination;
        this.vehicleType = vehicleType;
        this.distance = distance;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
