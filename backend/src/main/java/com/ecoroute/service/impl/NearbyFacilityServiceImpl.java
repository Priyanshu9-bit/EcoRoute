package com.ecoroute.service.impl;

import com.ecoroute.dto.FacilityDTO;
import com.ecoroute.service.NearbyFacilityService;
import com.ecoroute.util.GeoUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class NearbyFacilityServiceImpl implements NearbyFacilityService {

    private static final Logger log = LoggerFactory.getLogger(NearbyFacilityServiceImpl.class);
    private final RestTemplate restTemplate;

    @Value("${external.overpass.url:https://overpass-api.de/api/interpreter}")
    private String overpassUrl;

    @Value("${external.nominatim.url:https://nominatim.openstreetmap.org}")
    private String nominatimUrl;

    public NearbyFacilityServiceImpl() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(4000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public List<FacilityDTO> getNearbyFacilities(Double latitude, Double longitude, String facilityType, Double radiusKm) {
        if (latitude == null || longitude == null) {
            return Collections.emptyList();
        }

        double searchRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;
        String requestedType = (facilityType != null && !facilityType.isBlank()) ? facilityType.toUpperCase() : "ALL";

        List<String> typesToQuery = new ArrayList<>();
        if ("ALL".equalsIgnoreCase(requestedType)) {
            typesToQuery.addAll(List.of("HOSPITAL", "RESTAURANT", "HOTEL", "FUEL_STATION"));
        } else {
            typesToQuery.add(requestedType);
        }

        List<FacilityDTO> combinedResults = new ArrayList<>();

        for (String type : typesToQuery) {
            List<FacilityDTO> typeResults = fetchRealFacilities(latitude, longitude, type, searchRadius);
            combinedResults.addAll(typeResults);
        }

        // Deduplicate facilities by proximity
        List<FacilityDTO> deduplicated = new ArrayList<>();
        for (FacilityDTO f : combinedResults) {
            boolean exists = deduplicated.stream().anyMatch(existing ->
                    (existing.getName() != null && existing.getName().equalsIgnoreCase(f.getName())) ||
                    (Math.abs(existing.getLatitude() - f.getLatitude()) < 0.001 &&
                     Math.abs(existing.getLongitude() - f.getLongitude()) < 0.001)
            );
            if (!exists) {
                deduplicated.add(f);
            }
        }

        // Sort by distance ascending
        deduplicated.sort(Comparator.comparingDouble(f -> f.getDistance() != null ? f.getDistance() : 999.0));

        return deduplicated;
    }

    private List<FacilityDTO> fetchRealFacilities(Double lat, Double lon, String type, double radiusKm) {
        // Strategy 1: OpenStreetMap Nominatim with bounded viewbox (Fastest & most reliable)
        List<FacilityDTO> facilities = fetchFromNominatim(lat, lon, type, radiusKm);
        if (!facilities.isEmpty()) {
            return facilities;
        }

        // Strategy 2: Photon POI search API
        facilities = fetchFromPhoton(lat, lon, type);
        if (!facilities.isEmpty()) {
            return facilities;
        }

        // Strategy 3: Overpass API with proper POST request
        facilities = fetchFromOverpass(lat, lon, type, radiusKm);
        return facilities;
    }

    private List<FacilityDTO> fetchFromNominatim(Double lat, Double lon, String type, double radiusKm) {
        List<FacilityDTO> results = new ArrayList<>();
        try {
            double dLat = radiusKm / 111.0;
            double dLon = radiusKm / (111.0 * Math.max(0.1, Math.cos(Math.toRadians(lat))));

            double minLat = lat - dLat;
            double maxLat = lat + dLat;
            double minLon = lon - dLon;
            double maxLon = lon + dLon;

            String viewbox = String.format(Locale.US, "%.4f,%.4f,%.4f,%.4f", minLon, maxLat, maxLon, minLat);
            String searchTerm = getSearchKeywordForType(type);

            String url = nominatimUrl + "/search?format=json&q=" + searchTerm +
                    "&limit=5&viewbox=" + viewbox + "&bounded=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoRouteApp/2.0 (contact: support@ecoroute.org)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> items = response.getBody();
                for (Map<String, Object> item : items) {
                    String rawName = (String) item.get("name");
                    String displayName = (String) item.get("display_name");
                    String latStr = (String) item.get("lat");
                    String lonStr = (String) item.get("lon");

                    if (latStr != null && lonStr != null) {
                        double fLat = Double.parseDouble(latStr);
                        double fLon = Double.parseDouble(lonStr);
                        double dist = GeoUtils.calculateHaversineDistance(lat, lon, fLat, fLon);

                        String cleanName = (rawName != null && !rawName.isBlank()) ? rawName :
                                (displayName != null ? displayName.split(",")[0] : formatType(type));

                        results.add(FacilityDTO.builder()
                                .name(cleanName)
                                .type(type)
                                .latitude(fLat)
                                .longitude(fLon)
                                .distance(Math.round(dist * 10.0) / 10.0)
                                .build());
                    }
                }
            }
        } catch (Exception ex) {
            log.debug("Nominatim facility query error for {}: {}", type, ex.getMessage());
        }
        return results;
    }

    private List<FacilityDTO> fetchFromPhoton(Double lat, Double lon, String type) {
        List<FacilityDTO> results = new ArrayList<>();
        try {
            String keyword = getSearchKeywordForType(type);
            String url = String.format(Locale.US, "https://photon.komoot.io/api/?q=%s&lat=%.4f&lon=%.4f&limit=5", keyword, lat, lon);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoRouteApp/2.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> features = (List<Map<String, Object>>) response.getBody().get("features");
                if (features != null) {
                    for (Map<String, Object> feat : features) {
                        Map<String, Object> props = (Map<String, Object>) feat.get("properties");
                        Map<String, Object> geom = (Map<String, Object>) feat.get("geometry");
                        if (props != null && geom != null) {
                            List<Number> coords = (List<Number>) geom.get("coordinates");
                            if (coords != null && coords.size() >= 2) {
                                double fLon = coords.get(0).doubleValue();
                                double fLat = coords.get(1).doubleValue();
                                double dist = GeoUtils.calculateHaversineDistance(lat, lon, fLat, fLon);

                                // Skip POIs that are too far away (> 25 km)
                                if (dist <= 25.0) {
                                    String name = (String) props.get("name");
                                    if (name == null || name.isBlank()) {
                                        name = (String) props.get("street");
                                    }
                                    if (name == null || name.isBlank()) {
                                        name = formatType(type);
                                    }

                                    results.add(FacilityDTO.builder()
                                            .name(name)
                                            .type(type)
                                            .latitude(fLat)
                                            .longitude(fLon)
                                            .distance(Math.round(dist * 10.0) / 10.0)
                                            .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.debug("Photon POI query error for {}: {}", type, ex.getMessage());
        }
        return results;
    }

    private List<FacilityDTO> fetchFromOverpass(Double lat, Double lon, String type, double radiusKm) {
        List<FacilityDTO> results = new ArrayList<>();
        try {
            double radiusMeters = radiusKm * 1000.0;
            String osmFilter = buildOsmFilter(type);
            String overpassQuery = String.format(Locale.US,
                    "[out:json][timeout:5];(node%s(around:%.0f,%.4f,%.4f);way%s(around:%.0f,%.4f,%.4f););out center 6;",
                    osmFilter, radiusMeters, lat, lon, osmFilter, radiusMeters, lat, lon);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "EcoRouteApp/2.0");
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("data", overpassQuery);

            HttpEntity<org.springframework.util.MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(overpassUrl, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> elements = (List<Map<String, Object>>) response.getBody().get("elements");
                if (elements != null) {
                    for (Map<String, Object> el : elements) {
                        Double fLat = null;
                        Double fLon = null;
                        if (el.containsKey("lat") && el.containsKey("lon")) {
                            fLat = ((Number) el.get("lat")).doubleValue();
                            fLon = ((Number) el.get("lon")).doubleValue();
                        } else if (el.containsKey("center")) {
                            Map<String, Object> center = (Map<String, Object>) el.get("center");
                            fLat = ((Number) center.get("lat")).doubleValue();
                            fLon = ((Number) center.get("lon")).doubleValue();
                        }

                        if (fLat != null && fLon != null) {
                            Map<String, String> tags = (Map<String, String>) el.get("tags");
                            String name = tags != null && tags.containsKey("name") ? tags.get("name") : formatType(type);
                            double dist = GeoUtils.calculateHaversineDistance(lat, lon, fLat, fLon);

                            results.add(FacilityDTO.builder()
                                    .name(name)
                                    .type(type)
                                    .latitude(fLat)
                                    .longitude(fLon)
                                    .distance(Math.round(dist * 10.0) / 10.0)
                                    .build());
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.debug("Overpass query error for {}: {}", type, ex.getMessage());
        }
        return results;
    }

    private String getSearchKeywordForType(String type) {
        return switch (type) {
            case "HOSPITAL" -> "hospital";
            case "HOTEL" -> "hotel";
            case "RESTAURANT" -> "restaurant";
            case "FUEL_STATION" -> "fuel";
            case "GARAGE" -> "car repair";
            case "EV_CHARGING" -> "charging station";
            default -> "amenity";
        };
    }

    private String buildOsmFilter(String type) {
        return switch (type) {
            case "HOSPITAL" -> "[\"amenity\"=\"hospital\"]";
            case "HOTEL" -> "[\"tourism\"=\"hotel\"]";
            case "RESTAURANT" -> "[\"amenity\"=\"restaurant\"]";
            case "GARAGE" -> "[\"shop\"=\"car_repair\"]";
            case "FUEL_STATION" -> "[\"amenity\"=\"fuel\"]";
            case "EV_CHARGING" -> "[\"amenity\"=\"charging_station\"]";
            default -> "[\"amenity\"]";
        };
    }

    private String formatType(String type) {
        return type.substring(0, 1) + type.substring(1).toLowerCase().replace("_", " ");
    }
}
