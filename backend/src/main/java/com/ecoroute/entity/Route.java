package com.ecoroute.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    private Double distance;
    private Double duration;

    @Column(columnDefinition = "LONGTEXT")
    private String geometry;

    private String profile;
    private String summary;

    @Column(columnDefinition = "LONGTEXT")
    private String facilitiesData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Route() {}

    public Route(Long id, Journey journey, Double distance, Double duration, String geometry, String profile, String summary, String facilitiesData, LocalDateTime createdAt) {
        this.id = id;
        this.journey = journey;
        this.distance = distance;
        this.duration = duration;
        this.geometry = geometry;
        this.profile = profile;
        this.summary = summary;
        this.facilitiesData = facilitiesData;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Journey getJourney() { return journey; }
    public void setJourney(Journey journey) { this.journey = journey; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public String getGeometry() { return geometry; }
    public void setGeometry(String geometry) { this.geometry = geometry; }

    public String getProfile() { return profile; }
    public void setProfile(String profile) { this.profile = profile; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getFacilitiesData() { return facilitiesData; }
    public void setFacilitiesData(String facilitiesData) { this.facilitiesData = facilitiesData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
