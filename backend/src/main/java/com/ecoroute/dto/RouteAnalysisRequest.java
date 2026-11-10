package com.ecoroute.dto;

import com.ecoroute.entity.RequiredFacility;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class RouteAnalysisRequest {

    @NotNull(message = "Source latitude is required")
    private Double sourceLat;

    @NotNull(message = "Source longitude is required")
    private Double sourceLng;

    @NotNull(message = "Destination latitude is required")
    private Double destLat;

    @NotNull(message = "Destination longitude is required")
    private Double destLng;

    private Set<RequiredFacility> requiredFacilities;

    public RouteAnalysisRequest() {
    }

    public RouteAnalysisRequest(Double sourceLat, Double sourceLng, Double destLat, Double destLng, Set<RequiredFacility> requiredFacilities) {
        this.sourceLat = sourceLat;
        this.sourceLng = sourceLng;
        this.destLat = destLat;
        this.destLng = destLng;
        this.requiredFacilities = requiredFacilities;
    }

    public Double getSourceLat() { return sourceLat; }
    public void setSourceLat(Double sourceLat) { this.sourceLat = sourceLat; }

    public Double getSourceLng() { return sourceLng; }
    public void setSourceLng(Double sourceLng) { this.sourceLng = sourceLng; }

    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public Set<RequiredFacility> getRequiredFacilities() { return requiredFacilities; }
    public void setRequiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; }

    public static RouteAnalysisRequestBuilder builder() {
        return new RouteAnalysisRequestBuilder();
    }

    public static class RouteAnalysisRequestBuilder {
        private Double sourceLat;
        private Double sourceLng;
        private Double destLat;
        private Double destLng;
        private Set<RequiredFacility> requiredFacilities;

        public RouteAnalysisRequestBuilder sourceLat(Double sourceLat) { this.sourceLat = sourceLat; return this; }
        public RouteAnalysisRequestBuilder sourceLng(Double sourceLng) { this.sourceLng = sourceLng; return this; }
        public RouteAnalysisRequestBuilder destLat(Double destLat) { this.destLat = destLat; return this; }
        public RouteAnalysisRequestBuilder destLng(Double destLng) { this.destLng = destLng; return this; }
        public RouteAnalysisRequestBuilder requiredFacilities(Set<RequiredFacility> requiredFacilities) { this.requiredFacilities = requiredFacilities; return this; }

        public RouteAnalysisRequest build() {
            return new RouteAnalysisRequest(sourceLat, sourceLng, destLat, destLng, requiredFacilities);
        }
    }
}
