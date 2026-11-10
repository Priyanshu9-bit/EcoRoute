package com.ecoroute.dto;

import com.ecoroute.entity.RoadReportStatus;
import com.ecoroute.entity.RoadReportType;

import java.time.LocalDateTime;

public class RoadReportResponse {
    private Long id;
    private Long userId;
    private String location;
    private RoadReportType reportType;
    private String description;
    private RoadReportStatus status;
    private LocalDateTime createdAt;

    public RoadReportResponse() {}

    public RoadReportResponse(Long id, Long userId, String location, RoadReportType reportType, String description, RoadReportStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.location = location;
        this.reportType = reportType;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public RoadReportType getReportType() { return reportType; }
    public void setReportType(RoadReportType reportType) { this.reportType = reportType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RoadReportStatus getStatus() { return status; }
    public void setStatus(RoadReportStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
