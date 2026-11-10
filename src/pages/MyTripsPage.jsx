import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { apiService } from '../services/api';
import { 
  formatDate, 
  getStatusBadge, 
  getAqiBadgeColor, 
  getAqiCategoryText,
  formatDistance, 
  formatDurationDetailed 
} from '../utils/formatters';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaClock } from 'react-icons/fa';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [tripAqiMap, setTripAqiMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserJourneys();
        const journeys = data || [];
        setTrips(journeys);

        // Fetch real-time AQI for every trip so it is never blank
        journeys.forEach(async (trip) => {
          const route = trip.routes?.find(r => r.routeId === trip.selectedRouteId) || trip.routes?.[0] || {};
          
          if (route.airQuality?.aqi != null) {
            setTripAqiMap(prev => ({
              ...prev,
              [trip.id]: {
                aqi: route.airQuality.aqi,
                category: route.airQuality.pollutionCategory || getAqiCategoryText(route.airQuality.aqi)
              }
            }));
          } else {
            const lat = trip.destLat || trip.sourceLat;
            const lng = trip.destLng || trip.sourceLng;
            if (lat != null && lng != null) {
              try {
                const aqiData = await apiService.getAirQuality(lat, lng);
                if (aqiData?.aqi != null) {
                  setTripAqiMap(prev => ({
                    ...prev,
                    [trip.id]: {
                      aqi: aqiData.aqi,
                      category: aqiData.pollutionCategory || getAqiCategoryText(aqiData.aqi)
                    }
                  }));
                }
              } catch (err) {
                console.warn(`Could not fetch live AQI for trip ${trip.id}:`, err);
              }
            }
          }
        });
      } catch (err) {
        setError(err.message || 'Failed to load trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const source = trip.source || '';
    const destination = trip.destination || '';
    const status = trip.status || 'PLANNED';
    const matchesSearch =
      source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-8 py-4">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Travel Log</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trip History</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review your planned and completed journeys, real-time AQI ratings, and route travel metrics.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 bg-white border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-72">
            <InputField
              placeholder="Search by source or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <FaFilter /> Filter Status:
            </span>
            {['All', 'Completed', 'Planned'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        ) : (
          <Card className="overflow-hidden p-0 border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Trip ID</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Destination</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Distance & Time</th>
                    <th className="py-3.5 px-4">Average AQI</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No matching trips found.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip) => {
                      const route = trip.routes?.find(r => r.routeId === trip.selectedRouteId) || trip.routes?.[0] || {};
                      const distanceVal = route.distance != null ? route.distance : trip.distance;
                      const durationVal = route.duration != null ? route.duration : trip.duration;

                      // Real-time AQI resolution
                      const liveAqi = tripAqiMap[trip.id];
                      const aqiVal = route.airQuality?.aqi ?? route.aqi ?? liveAqi?.aqi;
                      const aqiCategory = route.airQuality?.pollutionCategory ?? route.aqiCategory ?? liveAqi?.category ?? getAqiCategoryText(aqiVal);

                      return (
                        <tr 
                          key={trip.id} 
                          onClick={() => navigate(`/route-results/${trip.id}`)}
                          className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                          title="Click to view full route details"
                        >
                          <td className="py-4 px-4 font-mono text-slate-500 font-semibold group-hover:text-green-700">
                            TRP-{trip.id}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            <div className="flex items-start gap-2 max-w-xs">
                              <FaMapMarkerAlt className="text-green-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{trip.source}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700 font-medium">
                            <span className="line-clamp-2 max-w-xs">{trip.destination}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                            {formatDate(trip.createdAt || trip.journeyDate)}
                          </td>
                          
                          {/* Real-time Distance & Time in km/m and hrs/mins */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-xs">
                              {formatDistance(distanceVal)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <FaClock className="text-[10px] text-slate-400 shrink-0" />
                              <span>{formatDurationDetailed(durationVal)}</span>
                            </div>
                          </td>

                          {/* Real-time AQI Column (Never blank) */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {aqiVal != null ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-extrabold shadow-2xs ${getAqiBadgeColor(aqiVal)}`}>
                                <span>🌿</span>
                                <span>AQI {aqiVal}</span>
                                <span className="text-[10px] opacity-80 font-semibold">({aqiCategory})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold bg-slate-100 text-slate-500 border-slate-200 animate-pulse">
                                <span>🌿</span>
                                <span>Fetching AQI...</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getStatusBadge(trip.status || 'PLANNED')}`}>
                              {trip.status || 'PLANNED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
