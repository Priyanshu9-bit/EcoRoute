package com.ecoroute.dto;

import com.ecoroute.entity.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SavedRouteRequest {

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    private String distance;

    public SavedRouteRequest() {}

    public SavedRouteRequest(String source, String destination, VehicleType vehicleType, String distance) {
        this.source = source;
        this.destination = destination;
        this.vehicleType = vehicleType;
        this.distance = distance;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }
}
