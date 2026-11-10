package com.ecoroute.dto;

import com.ecoroute.entity.VehicleType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ProfileRequest {

    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be valid")
    private Integer age;

    private String medicalInformation;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    public ProfileRequest() {
    }

    public ProfileRequest(String name, Integer age, String medicalInformation, VehicleType vehicleType) {
        this.name = name;
        this.age = age;
        this.medicalInformation = medicalInformation;
        this.vehicleType = vehicleType;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getMedicalInformation() { return medicalInformation; }
    public void setMedicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public static ProfileRequestBuilder builder() {
        return new ProfileRequestBuilder();
    }

    public static class ProfileRequestBuilder {
        private String name;
        private Integer age;
        private String medicalInformation;
        private VehicleType vehicleType;

        public ProfileRequestBuilder name(String name) { this.name = name; return this; }
        public ProfileRequestBuilder age(Integer age) { this.age = age; return this; }
        public ProfileRequestBuilder medicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; return this; }
        public ProfileRequestBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }

        public ProfileRequest build() {
            return new ProfileRequest(name, age, medicalInformation, vehicleType);
        }
    }
}
