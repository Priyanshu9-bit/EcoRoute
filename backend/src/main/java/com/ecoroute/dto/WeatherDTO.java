package com.ecoroute.dto;

public class WeatherDTO {
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private String weatherCondition;
    private Double rain;
    private Double windSpeed;
    private Double humidity;

    public WeatherDTO() {
    }

    public WeatherDTO(Double latitude, Double longitude, Double temperature, String weatherCondition, Double rain, Double windSpeed, Double humidity) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperature = temperature;
        this.weatherCondition = weatherCondition;
        this.rain = rain;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public Double getRain() { return rain; }
    public void setRain(Double rain) { this.rain = rain; }

    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public static WeatherDTOBuilder builder() {
        return new WeatherDTOBuilder();
    }

    public static class WeatherDTOBuilder {
        private Double latitude;
        private Double longitude;
        private Double temperature;
        private String weatherCondition;
        private Double rain;
        private Double windSpeed;
        private Double humidity;

        public WeatherDTOBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public WeatherDTOBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public WeatherDTOBuilder temperature(Double temperature) { this.temperature = temperature; return this; }
        public WeatherDTOBuilder weatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; return this; }
        public WeatherDTOBuilder rain(Double rain) { this.rain = rain; return this; }
        public WeatherDTOBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public WeatherDTOBuilder humidity(Double humidity) { this.humidity = humidity; return this; }

        public WeatherDTO build() {
            return new WeatherDTO(latitude, longitude, temperature, weatherCondition, rain, windSpeed, humidity);
        }
    }
}
