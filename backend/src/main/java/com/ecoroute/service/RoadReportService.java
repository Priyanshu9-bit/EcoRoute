package com.ecoroute.service;

import com.ecoroute.dto.RoadReportRequest;
import com.ecoroute.dto.RoadReportResponse;

import java.util.List;

public interface RoadReportService {
    RoadReportResponse createReport(Long userId, RoadReportRequest request);
    List<RoadReportResponse> getUserReports(Long userId);
    List<RoadReportResponse> getAllReports();
}
