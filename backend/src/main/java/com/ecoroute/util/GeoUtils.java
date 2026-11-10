package com.ecoroute.util;

import java.util.ArrayList;
import java.util.List;

public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public static List<List<Double>> interpolateCoordinates(double lat1, double lon1, double lat2, double lon2, int steps) {
        List<List<Double>> coordinates = new ArrayList<>();
        coordinates.add(List.of(lat1, lon1));

        for (int i = 1; i < steps; i++) {
            double fraction = (double) i / steps;
            double lat = lat1 + (lat2 - lat1) * fraction;
            double lon = lon1 + (lon2 - lon1) * fraction;
            coordinates.add(List.of(lat, lon));
        }

        coordinates.add(List.of(lat2, lon2));
        return coordinates;
    }
}
