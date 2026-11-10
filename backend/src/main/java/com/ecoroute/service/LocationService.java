package com.ecoroute.service;

import com.ecoroute.dto.GeocodeResponse;

public interface LocationService {
    GeocodeResponse geocode(String placeName);
    GeocodeResponse reverseGeocode(Double latitude, Double longitude);
}
