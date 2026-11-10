package com.ecoroute.service.impl;

import com.ecoroute.dto.RoadReportRequest;
import com.ecoroute.dto.RoadReportResponse;
import com.ecoroute.entity.RoadReport;
import com.ecoroute.entity.RoadReportStatus;
import com.ecoroute.entity.User;
import com.ecoroute.exception.ResourceNotFoundException;
import com.ecoroute.repository.RoadReportRepository;
import com.ecoroute.repository.UserRepository;
import com.ecoroute.service.RoadReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoadReportServiceImpl implements RoadReportService {

    private final RoadReportRepository roadReportRepository;
    private final UserRepository userRepository;

    public RoadReportServiceImpl(RoadReportRepository roadReportRepository, UserRepository userRepository) {
        this.roadReportRepository = roadReportRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RoadReportResponse createReport(Long userId, RoadReportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RoadReport report = new RoadReport();
        report.setUser(user);
        report.setLocation(request.getLocation());
        report.setReportType(request.getReportType());
        report.setDescription(request.getDescription());
        report.setStatus(RoadReportStatus.PENDING);

        RoadReport saved = roadReportRepository.save(report);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoadReportResponse> getUserReports(Long userId) {
        return roadReportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoadReportResponse> getAllReports() {
        return roadReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RoadReportResponse mapToResponse(RoadReport report) {
        return new RoadReportResponse(
                report.getId(),
                report.getUser().getId(),
                report.getLocation(),
                report.getReportType(),
                report.getDescription(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}
