package com.ecoroute.dto;

import com.ecoroute.entity.RoadReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RoadReportRequest {

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Report type is required")
    private RoadReportType reportType;

    private String description;

    public RoadReportRequest() {}

    public RoadReportRequest(String location, RoadReportType reportType, String description) {
        this.location = location;
        this.reportType = reportType;
        this.description = description;
    }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public RoadReportType getReportType() { return reportType; }
    public void setReportType(RoadReportType reportType) { this.reportType = reportType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
