import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import RouteMap from '../components/plan-journey/RouteMap';

const RouteResultsPage = () => {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [environment, setEnvironment] = useState(null);
  const [routesEnv, setRoutesEnv] = useState({}); // { [routeId]: { weather, aqi } }
  const [envLoading, setEnvLoading] = useState(false);
  const [roadReports, setRoadReports] = useState([]);
  const [liveFacilities, setLiveFacilities] = useState([]);
  const [facilityFilter, setFacilityFilter] = useState('ALL');

  // Calculate Shortest/Fastest
  const shortestRouteId = routes.length > 0 ? routes.reduce((prev, current) => (prev.distance < current.distance) ? prev : current).routeId : null;
  const fastestRouteId = routes.length > 0 ? routes.reduce((prev, current) => (prev.duration < current.duration) ? prev : current).routeId : null;

  useEffect(() => {
    fetchJourneyDetails();
  }, [journeyId]);

  const fetchJourneyDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getJourney(journeyId);
      setJourney(data);
      const fetchedRoutes = data.routes || [];
      setRoutes(fetchedRoutes);
      const initialRouteId = data.selectedRouteId || (fetchedRoutes.length > 0 ? fetchedRoutes[0].routeId : null);
      setSelectedRouteId(initialRouteId);
      
      const currentRoute = fetchedRoutes.find(r => r.routeId === initialRouteId);
      if (currentRoute?.facilities && currentRoute.facilities.length > 0) {
        setLiveFacilities(currentRoute.facilities);
      }

      // Fetch environmental data for all routes in parallel
      fetchEnvironmentForAllRoutes(data, fetchedRoutes, initialRouteId);
    } catch (err) {
      setError(err.message || 'Failed to load journey details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironmentForAllRoutes = async (journeyData, routesList, activeRouteId) => {
    setEnvLoading(true);
    const envMap = {};

    try {
      // 1. Fetch road reports
      apiService.getAllRoadReports()
        .then(reports => setRoadReports(reports || []))
        .catch(e => console.warn('Could not fetch road reports', e));

      // 2. Fetch weather and AQI for every available route in parallel
      await Promise.all(
        (routesList || []).map(async (route) => {
          if (route.weather && route.airQuality) {
            envMap[route.routeId] = { weather: route.weather, aqi: route.airQuality };
            return;
          }

          // Sample coordinates along the route: midpoint coordinates or destination
          let lat = journeyData?.destLat;
          let lng = journeyData?.destLng;
          if (route.geometry && route.geometry.length > 0) {
            const midPt = route.geometry[Math.floor(route.geometry.length / 2)];
            lat = midPt[0];
            lng = midPt[1];
          }

          if (lat != null && lng != null) {
            try {
              const [weather, aqi] = await Promise.all([
                apiService.getWeather(lat, lng),
                apiService.getAirQuality(lat, lng)
              ]);
              envMap[route.routeId] = { weather, aqi };
            } catch (err) {
              console.warn(`Failed env fetch for route ${route.routeId}:`, err);
            }
          }
        })
      );

      setRoutesEnv(envMap);

      // Set active environment
      if (activeRouteId && envMap[activeRouteId]) {
        setEnvironment(envMap[activeRouteId]);
      } else if (journeyData?.destLat && journeyData?.destLng) {
        const [w, a] = await Promise.all([
          apiService.getWeather(journeyData.destLat, journeyData.destLng),
          apiService.getAirQuality(journeyData.destLat, journeyData.destLng)
        ]);
        setEnvironment({ weather: w, aqi: a });
      }

      // Check facilities for active route
      const activeRoute = (routesList || []).find(r => r.routeId === activeRouteId);
      if (activeRoute?.facilities && activeRoute.facilities.length > 0) {
        setLiveFacilities(activeRoute.facilities);
      } else if (journeyData?.destLat && journeyData?.destLng) {
        const facs = await apiService.getFacilities(journeyData.destLat, journeyData.destLng, 'ALL', 15.0);
        if (facs && facs.length > 0) {
          setLiveFacilities(facs);
        }
      }
    } catch (e) {
      console.warn("Environmental fetch completed with notice:", e);
    } finally {
      setEnvLoading(false);
    }
  };

  const handleSelectRoute = async (routeId) => {
    if (selectedRouteId === routeId) return;
    setSelectedRouteId(routeId);

    // Immediately switch environment to the newly selected route
    if (routesEnv[routeId]) {
      setEnvironment(routesEnv[routeId]);
    } else {
      const route = routes.find(r => r.routeId === routeId);
      let lat = journey?.destLat;
      let lng = journey?.destLng;
      if (route?.geometry && route.geometry.length > 0) {
        const midPt = route.geometry[Math.floor(route.geometry.length / 2)];
        lat = midPt[0];
        lng = midPt[1];
      }
      if (lat != null && lng != null) {
        setEnvLoading(true);
        Promise.all([
          apiService.getWeather(lat, lng),
          apiService.getAirQuality(lat, lng)
        ]).then(([w, a]) => {
          setEnvironment({ weather: w, aqi: a });
          setRoutesEnv(prev => ({ ...prev, [routeId]: { weather: w, aqi: a } }));
        }).finally(() => {
          setEnvLoading(false);
        });
      }
    }

    const currentRoute = routes.find(r => r.routeId === routeId);
    if (currentRoute?.facilities && currentRoute.facilities.length > 0) {
      setLiveFacilities(currentRoute.facilities);
    }

    try {
      await apiService.selectRoute(journeyId, routeId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRoute = async () => {
    if (!selectedRouteId || !journey) return;
    const route = routes.find(r => r.routeId === selectedRouteId);
    if (!route) return;

    try {
      await apiService.saveRoute({
        source: journey.source,
        destination: journey.destination,
        distance: route.distance,
        duration: route.duration,
        vehicleType: journey.vehicleType,
        travelType: journey.travelType,
        geometry: JSON.stringify(route.geometry)
      });
      alert('Route saved successfully!');
    } catch (error) {
      alert('Failed to save route: ' + error.message);
    }
  };

  const handleStartJourney = () => {
    if (!selectedRouteId || !journey) return;
    const route = routes.find(r => r.routeId === selectedRouteId) || routes[0];
    const navData = {
      journeyId: journey.id || journeyId,
      selectedRouteId: selectedRouteId,
      journey,
      selectedRoute: route
    };
    try {
      sessionStorage.setItem('active_navigation_journey', JSON.stringify(navData));
    } catch (e) {
      console.warn('Could not cache active navigation journey', e);
    }
    navigate(`/navigation/${selectedRouteId}`, { state: navData });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
  };

  const getSelectedFacilities = () => {
    const route = routes.find(r => r.routeId === selectedRouteId);
    if (route?.facilities && route.facilities.length > 0) {
      return route.facilities;
    }
    return liveFacilities || [];
  };

  const getFacilitySummary = (facilitiesList) => {
    if (!facilitiesList || facilitiesList.length === 0) return null;
    
    const counts = {};
    facilitiesList.forEach(f => {
      const type = f.type || 'Facility';
      counts[type] = (counts[type] || 0) + 1;
    });

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {Object.entries(counts).map(([type, count]) => {
          const icon = type === 'HOSPITAL' ? '🏥' : type === 'HOTEL' ? '🏨' : type === 'RESTAURANT' ? '🍽️' : type === 'FUEL_STATION' ? '⛽' : '📍';
          return (
            <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
              <span>{icon}</span> {count} {type.replace('_', ' ')}
            </span>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout fullWidth noFooter>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-xl text-gray-600">Finding the best available routes...</p>
        </div>
      </MainLayout>
    );
  }

  const selectedRoute = routes.find(r => r.routeId === selectedRouteId);

  return (
    <MainLayout fullWidth noFooter>
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-50">
        
        {/* Sidebar / Route Details */}
        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-1/2 md:h-full flex flex-col border-r border-gray-200 bg-white z-10 shadow-lg relative">
          
          <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Route Options</h1>
            <p className="text-sm text-gray-600 mb-1 font-medium flex justify-between">
              <span>{journey?.source}</span>
              <span>→</span>
              <span>{journey?.destination}</span>
            </p>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">{error}</div>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
                         {/* Available Routes List */}
            <div>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-extrabold mb-3 flex items-center justify-between">
                <span>Available Routes</span>
                <span className="text-[11px] font-bold text-slate-400 lowercase">{routes.length} options</span>
              </h2>
              {routes.length === 0 ? (
                <p className="text-gray-500 text-sm">No route could be generated for this journey.</p>
              ) : (
                <div className="space-y-3">
                  {routes.map((route) => {
                    const isSelected = selectedRouteId === route.routeId;
                    const isShortest = shortestRouteId === route.routeId;
                    const isFastest = fastestRouteId === route.routeId;

                    const routeEnv = routesEnv[route.routeId] || { weather: route.weather, aqi: route.airQuality };
                    const aqiVal = routeEnv?.aqi?.aqi;
                    const aqiCategory = routeEnv?.aqi?.pollutionCategory || (aqiVal != null ? (aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Moderate' : aqiVal <= 150 ? 'Unhealthy' : 'Very Unhealthy') : null);
                    
                    const weatherTemp = routeEnv?.weather?.temperature;
                    const weatherCond = routeEnv?.weather?.weatherCondition;

                    // Color code for AQI
                    const aqiColorClass = aqiVal == null 
                      ? 'bg-slate-100 text-slate-600 border-slate-200' 
                      : aqiVal <= 50 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : aqiVal <= 100 
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : aqiVal <= 150 
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200';

                    return (
                      <div 
                        key={route.routeId}
                        onClick={() => handleSelectRoute(route.routeId)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20' 
                            : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className={`font-black text-sm tracking-tight ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                              {route.distance} km <span className="text-slate-300 font-normal mx-1">|</span> {formatDuration(route.duration)}
                            </h3>
                            {route.summary && (
                              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[210px]">{route.summary}</p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-col items-end shrink-0">
                            {isFastest && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">⚡ Fastest</span>}
                            {isShortest && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black">📏 Shortest</span>}
                          </div>
                        </div>

                        {/* Real AQI & Weather telemetry chips for this route */}
                        <div className="flex flex-wrap items-center gap-1.5 my-2 pt-2 border-t border-slate-100">
                          {/* Live AQI Badge */}
                          {aqiVal != null ? (
                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 shadow-2xs ${aqiColorClass}`}>
                              <span>🌿</span>
                              <span>AQI {aqiVal}</span>
                              <span className="text-[10px] font-medium opacity-80">({aqiCategory})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md animate-pulse">
                              🌿 Fetching AQI...
                            </span>
                          )}

                          {/* Live Weather Badge */}
                          {weatherTemp != null ? (
                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 flex items-center gap-1 shadow-2xs">
                              <span>🌤️</span>
                              <span>{Math.round(weatherTemp)}°C</span>
                              <span className="text-[10px] font-medium text-sky-600 truncate max-w-[90px]">{weatherCond}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md animate-pulse">
                              🌤️ Fetching Weather...
                            </span>
                          )}
                        </div>

                        {getFacilitySummary(route.facilities)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Route Details */}
            {selectedRoute && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-wider text-slate-500 font-black">Selected Route Details</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Live Telemetry
                  </span>
                </div>
                
                {/* Environmental Info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <span>🌍</span> LIVE ENVIRONMENT & ATMOSPHERE
                  </h3>

                  {envLoading ? (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                      <p className="text-xs text-slate-500 font-medium">Fetching real satellite weather & air quality...</p>
                    </div>
                  ) : !environment || (!environment.weather && !environment.aqi) ? (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center py-3">
                      <p className="text-xs text-slate-500">Live environmental data initializing...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Weather Detailed Card */}
                      {environment.weather && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <span>🌤️</span> Weather Conditions
                            </span>
                            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                              {environment.weather.weatherCondition}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{environment.weather.temperature}°C</span>
                            <span className="text-xs text-slate-500 font-medium">real-feel</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                            <div className="bg-slate-50 p-1.5 rounded-lg text-center">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Humidity</span>
                              <span className="font-bold text-slate-700">{environment.weather.humidity}%</span>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg text-center">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Wind</span>
                              <span className="font-bold text-slate-700">{environment.weather.windSpeed} km/h</span>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg text-center">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Rain</span>
                              <span className="font-bold text-slate-700">{environment.weather.rain} mm</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Air Quality Detailed Card */}
                      {environment.aqi && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <span>🌿</span> Air Quality Index (AQI)
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              environment.aqi.aqi <= 50 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : environment.aqi.aqi <= 100 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {environment.aqi.pollutionCategory}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{environment.aqi.aqi}</span>
                            <span className="text-xs font-semibold text-slate-500">US AQI scale</span>
                          </div>
                          
                          {/* Pollutant Micro-grid */}
                          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                            <div className="bg-slate-50 p-1 rounded-md text-center">
                              <span className="text-slate-400 block text-[9px] font-bold">PM2.5</span>
                              <span className="font-bold text-slate-700">{environment.aqi.pm25}</span>
                            </div>
                            <div className="bg-slate-50 p-1 rounded-md text-center">
                              <span className="text-slate-400 block text-[9px] font-bold">PM10</span>
                              <span className="font-bold text-slate-700">{environment.aqi.pm10}</span>
                            </div>
                            <div className="bg-slate-50 p-1 rounded-md text-center">
                              <span className="text-slate-400 block text-[9px] font-bold">NO₂</span>
                              <span className="font-bold text-slate-700">{environment.aqi.no2}</span>
                            </div>
                            <div className="bg-slate-50 p-1 rounded-md text-center">
                              <span className="text-slate-400 block text-[9px] font-bold">O₃</span>
                              <span className="font-bold text-slate-700">{environment.aqi.o3}</span>
                            </div>
                          </div>

                          {/* Eco Advisory */}
                          <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-1.5">
                            <span>💡</span>
                            <span className="leading-tight font-medium">
                              {environment.aqi.aqi <= 50 
                                ? 'Clean air corridor: open window ventilation recommended!'
                                : environment.aqi.aqi <= 100 
                                  ? 'Acceptable air quality for standard vehicle travel.'
                                  : 'Higher particulate levels detected: keep windows closed with AC recirculation.'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Road Reports */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">ROAD INFORMATION</h3>
                  {roadReports.length === 0 ? (
                    <p className="text-sm text-gray-500">No construction information available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {roadReports.slice(0,2).map(r => (
                        <li key={r.id} className="text-sm bg-orange-50 border border-orange-200 text-orange-800 p-2 rounded flex items-start gap-2">
                          <span>⚠</span>
                          <div>
                            <span className="font-bold">{r.reportType}</span>
                            <span className="block text-xs opacity-80">{r.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Real Facilities List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📍</span> REAL FACILITIES ALONG ROUTE
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {getSelectedFacilities().length} Places
                    </span>
                  </div>

                  {/* Facility Filter Pills */}
                  <div className="flex flex-wrap gap-1 pb-1">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'HOSPITAL', label: '🏥 Hospitals' },
                      { id: 'RESTAURANT', label: '🍽️ Restaurants' },
                      { id: 'HOTEL', label: '🏨 Hotels' },
                      { id: 'FUEL_STATION', label: '⛽ Fuel' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFacilityFilter(tab.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          facilityFilter === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {getSelectedFacilities().length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {getSelectedFacilities()
                        .filter(f => facilityFilter === 'ALL' || f.type === facilityFilter)
                        .map((f, i) => {
                          let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                          let icon = '📍';
                          if (f.type === 'HOSPITAL') { badgeBg = 'bg-rose-50 text-rose-700 border-rose-200'; icon = '🏥'; }
                          else if (f.type === 'RESTAURANT') { badgeBg = 'bg-amber-50 text-amber-800 border-amber-200'; icon = '🍽️'; }
                          else if (f.type === 'HOTEL') { badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200'; icon = '🏨'; }
                          else if (f.type === 'FUEL_STATION') { badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'; icon = '⛽'; }
                          else if (f.type === 'EV_CHARGING') { badgeBg = 'bg-teal-50 text-teal-700 border-teal-200'; icon = '⚡'; }

                          return (
                            <div key={i} className="bg-white p-2.5 text-xs rounded-xl border border-slate-200/80 flex items-start justify-between gap-2 shadow-2xs hover:border-emerald-300 transition-colors">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 block truncate">{f.name}</span>
                                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${badgeBg}`}>
                                    {f.type.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                                {f.distance != null ? `${f.distance} km` : 'Near route'}
                              </span>
                            </div>
                          );
                        })}
                      {getSelectedFacilities().filter(f => facilityFilter === 'ALL' || f.type === facilityFilter).length === 0 && (
                        <p className="text-xs text-slate-500 italic py-2 text-center">No {facilityFilter.toLowerCase().replace('_', ' ')} found in this search radius.</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      Searching real facilities (hospitals, hotels, restaurants) along route...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-white grid grid-cols-2 gap-3">
            <button 
              onClick={handleSaveRoute}
              disabled={!selectedRouteId}
              className="py-3 px-4 border-2 border-gray-800 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save Route
            </button>
            <button 
              onClick={handleStartJourney}
              disabled={!selectedRouteId}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              Start Journey
            </button>
          </div>
        </div>

        {/* Full Map Area */}
        <div className="flex-1 w-full h-1/2 md:h-full relative bg-slate-100">
          {journey && (
            <RouteMap 
              source={{ lat: journey.sourceLat, lng: journey.sourceLng, name: journey.source }} 
              destination={{ lat: journey.destLat, lng: journey.destLng, name: journey.destination }} 
              routes={routes}
              selectedRouteId={selectedRouteId}
              onRouteSelect={handleSelectRoute}
              facilities={getSelectedFacilities()}
              aqiData={environment?.aqi}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default RouteResultsPage;
