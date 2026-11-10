package com.ecoroute.service;

import com.ecoroute.dto.RouteDTO;
import com.ecoroute.dto.RouteSearchRequest;

import java.util.List;

public interface RoutingService {
    List<RouteDTO> calculateRoutes(RouteSearchRequest request);
    List<RouteDTO> calculateRoutes(Double sourceLat, Double sourceLng, Double destLat, Double destLng, String profile);
}
