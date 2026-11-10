package com.ecoroute.repository;

import com.ecoroute.entity.RoadReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadReportRepository extends JpaRepository<RoadReport, Long> {
    List<RoadReport> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RoadReport> findAllByOrderByCreatedAtDesc();
}
