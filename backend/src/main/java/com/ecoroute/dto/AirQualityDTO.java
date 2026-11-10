package com.ecoroute.dto;

public class AirQualityDTO {
    private Double latitude;
    private Double longitude;
    private Integer aqi;
    private String pollutionCategory;
    private Double pm25;
    private Double pm10;
    private Double no2;
    private Double o3;

    public AirQualityDTO() {
    }

    public AirQualityDTO(Double latitude, Double longitude, Integer aqi, String pollutionCategory, Double pm25, Double pm10, Double no2, Double o3) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.aqi = aqi;
        this.pollutionCategory = pollutionCategory;
        this.pm25 = pm25;
        this.pm10 = pm10;
        this.no2 = no2;
        this.o3 = o3;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getAqi() { return aqi; }
    public void setAqi(Integer aqi) { this.aqi = aqi; }

    public String getPollutionCategory() { return pollutionCategory; }
    public void setPollutionCategory(String pollutionCategory) { this.pollutionCategory = pollutionCategory; }

    public Double getPm25() { return pm25; }
    public void setPm25(Double pm25) { this.pm25 = pm25; }

    public Double getPm10() { return pm10; }
    public void setPm10(Double pm10) { this.pm10 = pm10; }

    public Double getNo2() { return no2; }
    public void setNo2(Double no2) { this.no2 = no2; }

    public Double getO3() { return o3; }
    public void setO3(Double o3) { this.o3 = o3; }

    public static AirQualityDTOBuilder builder() {
        return new AirQualityDTOBuilder();
    }

    public static class AirQualityDTOBuilder {
        private Double latitude;
        private Double longitude;
        private Integer aqi;
        private String pollutionCategory;
        private Double pm25;
        private Double pm10;
        private Double no2;
        private Double o3;

        public AirQualityDTOBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AirQualityDTOBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public AirQualityDTOBuilder aqi(Integer aqi) { this.aqi = aqi; return this; }
        public AirQualityDTOBuilder pollutionCategory(String pollutionCategory) { this.pollutionCategory = pollutionCategory; return this; }
        public AirQualityDTOBuilder pm25(Double pm25) { this.pm25 = pm25; return this; }
        public AirQualityDTOBuilder pm10(Double pm10) { this.pm10 = pm10; return this; }
        public AirQualityDTOBuilder no2(Double no2) { this.no2 = no2; return this; }
        public AirQualityDTOBuilder o3(Double o3) { this.o3 = o3; return this; }

        public AirQualityDTO build() {
            return new AirQualityDTO(latitude, longitude, aqi, pollutionCategory, pm25, pm10, no2, o3);
        }
    }
}
