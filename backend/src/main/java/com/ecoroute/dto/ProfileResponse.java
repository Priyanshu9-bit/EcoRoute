package com.ecoroute.dto;

import com.ecoroute.entity.VehicleType;

public class ProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private Integer age;
    private String medicalInformation;
    private VehicleType vehicleType;
    private Boolean profileCompletionStatus;

    public ProfileResponse() {
    }

    public ProfileResponse(Long id, Long userId, String name, String email, Integer age, String medicalInformation, VehicleType vehicleType, Boolean profileCompletionStatus) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.age = age;
        this.medicalInformation = medicalInformation;
        this.vehicleType = vehicleType;
        this.profileCompletionStatus = profileCompletionStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getMedicalInformation() { return medicalInformation; }
    public void setMedicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public Boolean getProfileCompletionStatus() { return profileCompletionStatus; }
    public void setProfileCompletionStatus(Boolean profileCompletionStatus) { this.profileCompletionStatus = profileCompletionStatus; }

    public static ProfileResponseBuilder builder() {
        return new ProfileResponseBuilder();
    }

    public static class ProfileResponseBuilder {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private Integer age;
        private String medicalInformation;
        private VehicleType vehicleType;
        private Boolean profileCompletionStatus;

        public ProfileResponseBuilder id(Long id) { this.id = id; return this; }
        public ProfileResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public ProfileResponseBuilder name(String name) { this.name = name; return this; }
        public ProfileResponseBuilder email(String email) { this.email = email; return this; }
        public ProfileResponseBuilder age(Integer age) { this.age = age; return this; }
        public ProfileResponseBuilder medicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; return this; }
        public ProfileResponseBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }
        public ProfileResponseBuilder profileCompletionStatus(Boolean profileCompletionStatus) { this.profileCompletionStatus = profileCompletionStatus; return this; }

        public ProfileResponse build() {
            return new ProfileResponse(id, userId, name, email, age, medicalInformation, vehicleType, profileCompletionStatus);
        }
    }
}
