package com.ecoroute.service;

import com.ecoroute.dto.RouteAnalysisRequest;
import com.ecoroute.dto.RouteAnalysisResponse;

public interface RouteAnalysisService {
    RouteAnalysisResponse analyzeRoute(RouteAnalysisRequest request);
}
