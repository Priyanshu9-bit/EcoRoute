package com.ecoroute.dto;

import java.util.List;

public class DashboardResponse {
    private UserDTO user;
    private ProfileResponse profile;
    private List<JourneyResponse> recentTrips;
    private List<SavedRouteResponse> savedRoutes;
    private DashboardPreferences preferences;

    public DashboardResponse() {
    }

    public DashboardResponse(UserDTO user, ProfileResponse profile, List<JourneyResponse> recentTrips, List<SavedRouteResponse> savedRoutes, DashboardPreferences preferences) {
        this.user = user;
        this.profile = profile;
        this.recentTrips = recentTrips;
        this.savedRoutes = savedRoutes;
        this.preferences = preferences;
    }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public ProfileResponse getProfile() { return profile; }
    public void setProfile(ProfileResponse profile) { this.profile = profile; }

    public List<JourneyResponse> getRecentTrips() { return recentTrips; }
    public void setRecentTrips(List<JourneyResponse> recentTrips) { this.recentTrips = recentTrips; }

    public List<SavedRouteResponse> getSavedRoutes() { return savedRoutes; }
    public void setSavedRoutes(List<SavedRouteResponse> savedRoutes) { this.savedRoutes = savedRoutes; }

    public DashboardPreferences getPreferences() { return preferences; }
    public void setPreferences(DashboardPreferences preferences) { this.preferences = preferences; }

    public static class DashboardPreferences {
        private String vehicle;
        private String preferredRoute;

        public DashboardPreferences() {}

        public DashboardPreferences(String vehicle, String preferredRoute) {
            this.vehicle = vehicle;
            this.preferredRoute = preferredRoute;
        }

        public String getVehicle() { return vehicle; }
        public void setVehicle(String vehicle) { this.vehicle = vehicle; }

        public String getPreferredRoute() { return preferredRoute; }
        public void setPreferredRoute(String preferredRoute) { this.preferredRoute = preferredRoute; }
    }
}

