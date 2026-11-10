package com.ecoroute.dto;

import jakarta.validation.constraints.NotNull;

public class RouteSearchRequest {

    @NotNull(message = "Source latitude is required")
    private Double sourceLat;

    @NotNull(message = "Source longitude is required")
    private Double sourceLng;

    @NotNull(message = "Destination latitude is required")
    private Double destLat;

    @NotNull(message = "Destination longitude is required")
    private Double destLng;

    private String profile;

    public RouteSearchRequest() {
    }

    public RouteSearchRequest(Double sourceLat, Double sourceLng, Double destLat, Double destLng, String profile) {
        this.sourceLat = sourceLat;
        this.sourceLng = sourceLng;
        this.destLat = destLat;
        this.destLng = destLng;
        this.profile = profile;
    }

    public Double getSourceLat() { return sourceLat; }
    public void setSourceLat(Double sourceLat) { this.sourceLat = sourceLat; }

    public Double getSourceLng() { return sourceLng; }
    public void setSourceLng(Double sourceLng) { this.sourceLng = sourceLng; }

    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public String getProfile() { return profile; }
    public void setProfile(String profile) { this.profile = profile; }

    public static RouteSearchRequestBuilder builder() {
        return new RouteSearchRequestBuilder();
    }

    public static class RouteSearchRequestBuilder {
        private Double sourceLat;
        private Double sourceLng;
        private Double destLat;
        private Double destLng;
        private String profile;

        public RouteSearchRequestBuilder sourceLat(Double sourceLat) { this.sourceLat = sourceLat; return this; }
        public RouteSearchRequestBuilder sourceLng(Double sourceLng) { this.sourceLng = sourceLng; return this; }
        public RouteSearchRequestBuilder destLat(Double destLat) { this.destLat = destLat; return this; }
        public RouteSearchRequestBuilder destLng(Double destLng) { this.destLng = destLng; return this; }
        public RouteSearchRequestBuilder profile(String profile) { this.profile = profile; return this; }

        public RouteSearchRequest build() {
            return new RouteSearchRequest(sourceLat, sourceLng, destLat, destLng, profile);
        }
    }
}
