package com.ecoroute.service.impl;

import com.ecoroute.dto.GeocodeResponse;
import com.ecoroute.exception.BadRequestException;
import com.ecoroute.service.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LocationServiceImpl implements LocationService {

    private static final Logger log = LoggerFactory.getLogger(LocationServiceImpl.class);
    private final RestTemplate restTemplate;

    @Value("${external.nominatim.url}")
    private String nominatimUrl;

    public LocationServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public GeocodeResponse geocode(String placeName) {
        if (placeName == null || placeName.isBlank()) {
            throw new BadRequestException("Place name cannot be empty");
        }

        GeocodeResponse curated = getCuratedCoordinates(placeName);
        if (curated != null) {
            return curated;
        }

        try {
            String url = nominatimUrl + "/search?q=" + placeName.trim() + "&format=json&limit=6&addressdetails=1";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoRouteBackend/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody();
                
                // Prioritize populated places (city, town, village) or points of interest over broad district boundaries
                Map<String, Object> bestMatch = null;
                for (Map<String, Object> item : results) {
                    String clazz = (String) item.get("class");
                    String type = (String) item.get("type");
                    String addresstype = (String) item.get("addresstype");

                    boolean isBroadBoundary = "boundary".equalsIgnoreCase(clazz) || 
                                              "state_district".equalsIgnoreCase(addresstype) || 
                                              "county".equalsIgnoreCase(addresstype);

                    if (!isBroadBoundary) {
                        bestMatch = item;
                        break;
                    }
                }

                // If only broad district boundary was returned, try querying placeName + " town"
                if (bestMatch == null) {
                    try {
                        String townUrl = nominatimUrl + "/search?q=" + placeName.trim() + "+town&format=json&limit=2";
                        ResponseEntity<List> townResp = restTemplate.exchange(townUrl, HttpMethod.GET, entity, List.class);
                        if (townResp.getStatusCode().is2xxSuccessful() && townResp.getBody() != null && !townResp.getBody().isEmpty()) {
                            bestMatch = (Map<String, Object>) townResp.getBody().get(0);
                        }
                    } catch (Exception ignored) {}
                }

                if (bestMatch == null) {
                    bestMatch = results.get(0);
                }

                String displayName = (String) bestMatch.get("display_name");
                Double lat = Double.parseDouble(String.valueOf(bestMatch.get("lat")));
                Double lon = Double.parseDouble(String.valueOf(bestMatch.get("lon")));

                return GeocodeResponse.builder()
                        .placeName(displayName != null ? displayName : placeName)
                        .latitude(lat)
                        .longitude(lon)
                        .build();
            }
        } catch (Exception ex) {
            log.error("Geocoding failed for place: {}. Error: {}", placeName, ex.getMessage());
        }

        return getFallbackCoordinates(placeName);
    }

    private GeocodeResponse getCuratedCoordinates(String placeName) {
        String lower = placeName.trim().toLowerCase();
        if (lower.equals("rayagada") || lower.equals("rayagada town") || lower.equals("rayagada city")) {
            return new GeocodeResponse("Rayagada, Odisha, India", 19.1696, 83.4180);
        } else if (lower.contains("rayagada railway") || lower.contains("rayagada station")) {
            return new GeocodeResponse("Rayagada Railway Station, Rayagada, Odisha, India", 19.1754, 83.4107);
        } else if (lower.equals("gunupur") || lower.equals("gunupur town")) {
            return new GeocodeResponse("Gunupur, Rayagada, Odisha, 765022, India", 19.0714, 83.8149);
        } else if (lower.contains("giet") || lower.contains("giet university")) {
            return new GeocodeResponse("GIET University, Gunupur, Rayagada, Odisha, 765022, India", 19.0488, 83.8317);
        } else if (lower.equals("koraput") || lower.equals("koraput town")) {
            return new GeocodeResponse("Koraput, Odisha, India", 18.8135, 82.7123);
        } else if (lower.equals("jeypore") || lower.equals("jeypore town")) {
            return new GeocodeResponse("Jeypore, Koraput, Odisha, India", 18.8550, 82.5683);
        } else if (lower.equals("berhampur") || lower.equals("brahmapur")) {
            return new GeocodeResponse("Berhampur, Ganjam, Odisha, India", 19.3149, 84.7941);
        }
        return null;
    }

    @Override
    public GeocodeResponse reverseGeocode(Double latitude, Double longitude) {
        try {
            String url = nominatimUrl + "/reverse?lat=" + latitude + "&lon=" + longitude + "&format=json";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoRouteBackend/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String displayName = (String) body.get("display_name");
                return GeocodeResponse.builder()
                        .placeName(displayName != null ? displayName : "Location (" + latitude + ", " + longitude + ")")
                        .latitude(latitude)
                        .longitude(longitude)
                        .build();
            }
        } catch (Exception ex) {
            log.error("Reverse geocoding failed for lat: {}, lon: {}. Error: {}", latitude, longitude, ex.getMessage());
        }

        return GeocodeResponse.builder()
                .placeName("Location (" + latitude + ", " + longitude + ")")
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }

    private GeocodeResponse getFallbackCoordinates(String placeName) {
        String lower = placeName.toLowerCase();
        if (lower.contains("bhubaneswar")) {
            return new GeocodeResponse("Bhubaneswar, Odisha, India", 20.2961, 85.8245);
        } else if (lower.contains("cuttack")) {
            return new GeocodeResponse("Cuttack, Odisha, India", 20.4625, 85.8828);
        } else if (lower.contains("puri")) {
            return new GeocodeResponse("Puri, Odisha, India", 19.8135, 85.8312);
        } else if (lower.contains("delhi")) {
            return new GeocodeResponse("New Delhi, India", 28.6139, 77.2090);
        } else if (lower.contains("mumbai")) {
            return new GeocodeResponse("Mumbai, Maharashtra, India", 19.0760, 72.8777);
        } else if (lower.contains("bangalore") || lower.contains("bengaluru")) {
            return new GeocodeResponse("Bengaluru, Karnataka, India", 12.9716, 77.5946);
        }
        return new GeocodeResponse(placeName + " (Location)", 20.2961, 85.8245);
    }
}
