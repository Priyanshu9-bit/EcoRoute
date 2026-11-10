package com.ecoroute.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FacilityDTO {
    private String name;
    private String type;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private String openingHours;

    public FacilityDTO() {
    }

    public FacilityDTO(String name, String type, Double latitude, Double longitude, Double distance, String openingHours) {
        this.name = name;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distance = distance;
        this.openingHours = openingHours;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public static FacilityDTOBuilder builder() {
        return new FacilityDTOBuilder();
    }

    public static class FacilityDTOBuilder {
        private String name;
        private String type;
        private Double latitude;
        private Double longitude;
        private Double distance;
        private String openingHours;

        public FacilityDTOBuilder name(String name) { this.name = name; return this; }
        public FacilityDTOBuilder type(String type) { this.type = type; return this; }
        public FacilityDTOBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public FacilityDTOBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public FacilityDTOBuilder distance(Double distance) { this.distance = distance; return this; }
        public FacilityDTOBuilder openingHours(String openingHours) { this.openingHours = openingHours; return this; }

        public FacilityDTO build() {
            return new FacilityDTO(name, type, latitude, longitude, distance, openingHours);
        }
    }
}
