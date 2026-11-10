package com.ecoroute.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer age;

    @Column(name = "medical_information", columnDefinition = "TEXT")
    private String medicalInformation;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType;

    @Column(name = "profile_completion_status", nullable = false)
    private Boolean profileCompletionStatus;

    public UserProfile() {
    }

    public UserProfile(Long id, User user, Integer age, String medicalInformation, VehicleType vehicleType, Boolean profileCompletionStatus) {
        this.id = id;
        this.user = user;
        this.age = age;
        this.medicalInformation = medicalInformation;
        this.vehicleType = vehicleType;
        this.profileCompletionStatus = profileCompletionStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getMedicalInformation() { return medicalInformation; }
    public void setMedicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public Boolean getProfileCompletionStatus() { return profileCompletionStatus; }
    public void setProfileCompletionStatus(Boolean profileCompletionStatus) { this.profileCompletionStatus = profileCompletionStatus; }

    public static UserProfileBuilder builder() {
        return new UserProfileBuilder();
    }

    public static class UserProfileBuilder {
        private Long id;
        private User user;
        private Integer age;
        private String medicalInformation;
        private VehicleType vehicleType;
        private Boolean profileCompletionStatus;

        public UserProfileBuilder id(Long id) { this.id = id; return this; }
        public UserProfileBuilder user(User user) { this.user = user; return this; }
        public UserProfileBuilder age(Integer age) { this.age = age; return this; }
        public UserProfileBuilder medicalInformation(String medicalInformation) { this.medicalInformation = medicalInformation; return this; }
        public UserProfileBuilder vehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; return this; }
        public UserProfileBuilder profileCompletionStatus(Boolean profileCompletionStatus) { this.profileCompletionStatus = profileCompletionStatus; return this; }

        public UserProfile build() {
            return new UserProfile(id, user, age, medicalInformation, vehicleType, profileCompletionStatus);
        }
    }
}
