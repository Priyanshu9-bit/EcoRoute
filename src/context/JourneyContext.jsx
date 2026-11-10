import React, { useState } from 'react';
import { apiService } from '../services/api';
import { JourneyContext } from './JourneyContextObject';

export { JourneyContext };

export const JourneyProvider = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  const planJourney = async (source, destination, travelMode = 'Family', preferences = [], facilities = []) => {
    setLoading(true);
    try {
      const recommendations = await apiService.fetchRouteRecommendations(source, destination, travelMode, preferences, facilities);
      return recommendations;
    } finally {
      setLoading(false);
    }
  };

  const startJourney = (route, source, destination) => {
    const journeySession = {
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      route,
      source,
      destination,
      startTime: new Date().toISOString(),
      status: 'NAVIGATING',
      currentLocation: source,
      nextInstruction: 'Head north on Main Avenue for 400m, then take the Green Bypass exit.',
      remainingDistance: route.distance,
      estimatedArrival: route.estimatedTime
    };
    setActiveJourney(journeySession);
    return journeySession;
  };

  const endJourney = () => {
    if (!activeJourney) return null;

    const completedTrip = {
      id: activeJourney.id,
      source: activeJourney.source,
      destination: activeJourney.destination,
      date: new Date().toISOString().split('T')[0],
      distance: activeJourney.route.distance,
      duration: activeJourney.route.estimatedTime,
      aqiAvg: activeJourney.route.aqi,
      aqiStatus: activeJourney.route.aqiCategory,
      status: 'Completed',
      savedCO2: activeJourney.route.co2Emissions
    };

    setActiveJourney(null);
    return completedTrip;
  };

  // We are now saving routes directly via the backend in RouteResultsPage.jsx
  // So saveRoute here is just a stub if needed, or we can remove it.
  const saveRoute = async (route) => {
    console.log('Route saved via JourneyContext (deprecated, use apiService directly)');
  };

  return (
    <JourneyContext.Provider
      value={{
        activeJourney,
        loading,
        planJourney,
        startJourney,
        endJourney,
        saveRoute
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};
