package com.ecoroute.dto;

import jakarta.validation.constraints.NotNull;

public class SelectRouteRequest {
    @NotNull(message = "routeId is required")
    private Long routeId;

    public SelectRouteRequest() {}

    public SelectRouteRequest(Long routeId) {
        this.routeId = routeId;
    }

    public Long getRouteId() {
        return routeId;
    }

    public void setRouteId(Long routeId) {
        this.routeId = routeId;
    }
}
