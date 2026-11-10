package com.ecoroute.dto;

public class GeocodeResponse {
    private String placeName;
    private Double latitude;
    private Double longitude;

    public GeocodeResponse() {
    }

    public GeocodeResponse(String placeName, Double latitude, Double longitude) {
        this.placeName = placeName;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getPlaceName() { return placeName; }
    public void setPlaceName(String placeName) { this.placeName = placeName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public static GeocodeResponseBuilder builder() {
        return new GeocodeResponseBuilder();
    }

    public static class GeocodeResponseBuilder {
        private String placeName;
        private Double latitude;
        private Double longitude;

        public GeocodeResponseBuilder placeName(String placeName) { this.placeName = placeName; return this; }
        public GeocodeResponseBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public GeocodeResponseBuilder longitude(Double longitude) { this.longitude = longitude; return this; }

        public GeocodeResponse build() {
            return new GeocodeResponse(placeName, latitude, longitude);
        }
    }
}
