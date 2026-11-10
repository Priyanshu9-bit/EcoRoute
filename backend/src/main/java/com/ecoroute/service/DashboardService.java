package com.ecoroute.service;

import com.ecoroute.dto.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardData(Long userId);
}
