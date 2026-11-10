import React, { useState } from 'react';
import { apiService } from '../services/api';
import LocationInput from '../components/plan-journey/LocationInput';
import VehicleSelector from '../components/plan-journey/VehicleSelector';
import TravelTypeSelector from '../components/plan-journey/TravelTypeSelector';
import RoutePreferenceSelector from '../components/plan-journey/RoutePreferenceSelector';
import FacilitySelector from '../components/plan-journey/FacilitySelector';
import RouteMap from '../components/plan-journey/RouteMap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { QUICK_PRESETS, POPULAR_LOCATIONS } from '../utils/popularLocations';
import { FaExchangeAlt, FaMapPin, FaCrosshairs, FaCheck, FaRoute, FaMagic } from 'react-icons/fa';

const POPULAR_ROUTE_PAIRS = [
  {
    title: 'Delhi ➔ Agra (Taj Mahal)',
    source: { name: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
    dest: { name: 'Taj Mahal, Agra, Uttar Pradesh', lat: 27.1751, lng: 78.0421 }
  },
  {
    title: 'Bhubaneswar ➔ Puri Beach',
    source: { name: 'KIIT University, Patia, Bhubaneswar', lat: 20.3540, lng: 85.8172 },
    dest: { name: 'Golden Beach, Puri, Odisha', lat: 19.7983, lng: 85.8285 }
  },
  {
    title: 'Mumbai BKC ➔ Pune',
    source: { name: 'Bandra Kurla Complex (BKC), Mumbai', lat: 19.0657, lng: 72.8687 },
    dest: { name: 'Shivajinagar, Pune, Maharashtra', lat: 18.5314, lng: 73.8446 }
  },
  {
    title: 'Bangalore (BLR) ➔ Electronic City',
    source: { name: 'Kempegowda Int. Airport (BLR), Bengaluru', lat: 13.1986, lng: 77.7066 },
    dest: { name: 'Electronic City, Bengaluru', lat: 12.8452, lng: 77.6602 }
  }
];

const PlanJourneyPage = () => {
  const navigate = useNavigate();
  
  const [sourceName, setSourceName] = useState('');
  const [destName, setDestName] = useState('');
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  
  const [travelType, setTravelType] = useState('SOLO');
  const [vehicle, setVehicle] = useState('CAR');
  const [preferences, setPreferences] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Map Pin Picking state ('none' | 'source' | 'dest')
  const [mapPickMode, setMapPickMode] = useState('none');
  const [mapStatusMessage, setMapStatusMessage] = useState('');

  const handleGeocode = async (query, type, preFetchedCoords = null) => {
    try {
      setError('');
      if (!query && !preFetchedCoords) {
        if (type === 'source') {
          setSourceCoords(null);
          setSourceName('');
        } else {
          setDestCoords(null);
          setDestName('');
        }
        return;
      }

      if (preFetchedCoords) {
        if (type === 'source') {
          setSourceCoords(preFetchedCoords);
          setSourceName(query);
        } else {
          setDestCoords(preFetchedCoords);
          setDestName(query);
        }
        return;
      }

      // Check curated local landmarks first
      const qLower = query.toLowerCase().trim();
      const localMatch = POPULAR_LOCATIONS.find(l => 
        l.name.toLowerCase().includes(qLower) || 
        l.shortName.toLowerCase().includes(qLower) ||
        qLower.includes(l.shortName.toLowerCase())
      );
      if (localMatch) {
        const coords = { lat: localMatch.lat, lng: localMatch.lng };
        if (type === 'source') {
          setSourceCoords(coords);
          setSourceName(localMatch.name);
        } else {
          setDestCoords(coords);
          setDestName(localMatch.name);
        }
        return;
      }

      // Fallback to backend / Photon geocoding
      try {
        const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`);
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          if (photonData?.features?.length > 0) {
            // Pick populated place, town, city, or hub over broad boundary
            const feat = photonData.features.find(f => {
              const p = f.properties || {};
              const cat = (p.osm_value || p.type || '').toLowerCase();
              return !cat.includes('administrative') && !cat.includes('county') && p.osm_key !== 'boundary';
            }) || photonData.features[0];
            const coords = { lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0] };
            const placeTitle = feat.properties?.name || query;
            if (type === 'source') {
              setSourceCoords(coords);
              setSourceName(placeTitle);
            } else {
              setDestCoords(coords);
              setDestName(placeTitle);
            }
            return;
          }
        }
      } catch (e) {}

      // Fallback to backend geocoding
      const data = await apiService.geocode(query);
      if (data && data.latitude && data.longitude) {
        const coords = { lat: data.latitude, lng: data.longitude };
        if (type === 'source') {
          setSourceCoords(coords);
          setSourceName(data.placeName || query);
        } else {
          setDestCoords(coords);
          setDestName(data.placeName || query);
        }
      } else {
        setError(`Could not find coordinates for ${type}.`);
      }
    } catch (err) {
      setError(`Failed to geocode ${type}. Please try again.`);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setSourceCoords({ lat: latitude, lng: longitude });
          setSourceName('Current Location');
          
          try {
            const data = await apiService.reverseGeocode(latitude, longitude);
            if (data && data.placeName) {
              setSourceName(data.placeName);
            }
          } catch (e) {}
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError('Unable to access your location. Please enter starting point manually.');
      }
    );
  };

  // Swap starting point and destination
  const handleSwap = () => {
    setSourceName(destName);
    setDestName(sourceName);
    setSourceCoords(destCoords);
    setDestCoords(sourceCoords);
  };

  // Handle clicking on map to pick location
  const handleMapClick = async ({ lat, lng }) => {
    if (mapPickMode === 'none') return;

    setMapStatusMessage('Identifying place on map...');
    let placeName = `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    try {
      // Fast reverse geocoding via Photon / OSM
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.features?.length > 0) {
          const p = data.features[0].properties;
          const parts = [p.name, p.street, p.city, p.state].filter(Boolean);
          if (parts.length > 0) placeName = parts.join(', ');
        }
      }
    } catch (e) {
      try {
        const backendData = await apiService.reverseGeocode(lat, lng);
        if (backendData?.placeName) placeName = backendData.placeName;
      } catch (err2) {}
    }

    if (mapPickMode === 'source') {
      setSourceCoords({ lat, lng });
      setSourceName(placeName);
      setMapStatusMessage(`✓ Starting Point (A) set from Map!`);
    } else if (mapPickMode === 'dest') {
      setDestCoords({ lat, lng });
      setDestName(placeName);
      setMapStatusMessage(`✓ Destination (B) set from Map!`);
    }

    // Auto-reset mode after 2 seconds
    setTimeout(() => {
      setMapPickMode('none');
      setMapStatusMessage('');
    }, 2000);
  };

  const handleApplyRoutePair = (pair) => {
    setSourceName(pair.source.name);
    setSourceCoords({ lat: pair.source.lat, lng: pair.source.lng });
    setDestName(pair.dest.name);
    setDestCoords({ lat: pair.dest.lat, lng: pair.dest.lng });
    setError('');
  };

  const handlePlanJourney = async () => {
    if (!sourceName || !destName) {
      setError('Source and Destination are required.');
      return;
    }
    if (sourceName === destName) {
      setError('Source and Destination cannot be the same.');
      return;
    }
    if (!sourceCoords || !destCoords) {
      setError('Please search and select valid coordinates for source and destination.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const journeyData = {
        source: sourceName,
        destination: destName,
        sourceLat: sourceCoords.lat,
        sourceLng: sourceCoords.lng,
        destLat: destCoords.lat,
        destLng: destCoords.lng,
        travelType: travelType,
        vehicleType: vehicle,
        routePreferences: preferences,
        requiredFacilities: facilities
      };

      const response = await apiService.planJourney(journeyData);
      
      if (response && response.id) {
        navigate(`/route-results/${response.id}`);
      } else {
        setError('Failed to create journey. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to plan journey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Plan Your Journey</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Google Maps-powered live points, multi-route environmental scoring & roadside amenities
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto">
            <span>🌱</span> Live Real-Time Routing Engine
          </div>
        </div>

        {/* 1-Click Popular Route Pairs Strip */}
        <div className="mb-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 p-2.5 rounded-2xl border border-emerald-200/70 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-emerald-900 flex items-center gap-1 shrink-0 text-[11px] uppercase tracking-wider">
            <FaMagic className="text-emerald-600" /> Popular Trips:
          </span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {POPULAR_ROUTE_PAIRS.map((pair, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyRoutePair(pair)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer text-xs"
              >
                {pair.title}
              </button>
            ))}
          </div>
        </div>
      
        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold mb-4 shadow-xs" id="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* 2-Column Responsive Layout for Laptops & Desktops */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Input Form Controls */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Location Inputs Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/90 space-y-3 relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1. Source & Destination
                </h2>
                <button 
                  type="button"
                  onClick={handleUseMyLocation} 
                  disabled={loading}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
                >
                  <span className="mr-1">📍</span> My GPS Location
                </button>
              </div>
              
              {/* Source Input */}
              <div className="space-y-1">
                <LocationInput 
                  label="Starting Point (A)" 
                  value={sourceName} 
                  onChange={setSourceName} 
                  coords={sourceCoords}
                  placeholder="Type city, airport, landmark, or street..." 
                  onGeocode={(v, coords) => handleGeocode(v, 'source', coords)}
                />
              </div>

              {/* Swap Button (⇄) */}
              <div className="flex items-center justify-center my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Reverse Origin and Destination"
                >
                  <FaExchangeAlt className="rotate-90 sm:rotate-0" />
                  <span>Swap Points</span>
                </button>
              </div>
              
              {/* Destination Input */}
              <div className="space-y-1">
                <LocationInput 
                  label="Destination (B)" 
                  value={destName} 
                  onChange={setDestName} 
                  coords={destCoords}
                  placeholder="Type destination, hotel, tourist spot..." 
                  onGeocode={(v, coords) => handleGeocode(v, 'dest', coords)} 
                />
              </div>

            </div>

            {/* 2. Travel Details */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/90 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span> 2. Travel Details & Vehicle
              </h2>
              <TravelTypeSelector selected={travelType} onChange={setTravelType} />
              <VehicleSelector selected={vehicle} onChange={setVehicle} />
            </div>

            {/* 3. Preferences & Facilities */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/90 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> 3. Route Preferences & Facilities
              </h2>
              <RoutePreferenceSelector selectedPrefs={preferences} onChange={setPreferences} />
              <FacilitySelector selectedFacilities={facilities} onChange={setFacilities} />
            </div>

          </div>

          {/* Right Column: Live Map Preview + Interactive Map Pinning */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            
            {/* Interactive Route Preview Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
              <div className="p-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  🗺️ Google Map Preview
                </span>
                
                {/* Map Click Pin Tool Selector */}
                <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMapPickMode(mapPickMode === 'source' ? 'none' : 'source')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      mapPickMode === 'source' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    📍 Pin (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapPickMode(mapPickMode === 'dest' ? 'none' : 'dest')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      mapPickMode === 'dest' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🏁 Pin (B)
                  </button>
                </div>
              </div>

              {/* Status bar if map click mode is active */}
              {mapPickMode !== 'none' && (
                <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-3 py-1.5 text-xs font-bold flex items-center justify-between animate-pulse">
                  <span>👉 Click anywhere on map to set {mapPickMode === 'source' ? 'Starting Point (A)' : 'Destination (B)'}!</span>
                  <button type="button" onClick={() => setMapPickMode('none')} className="text-amber-800 font-black">✕</button>
                </div>
              )}

              {mapStatusMessage && (
                <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-3 py-1.5 text-xs font-bold">
                  {mapStatusMessage}
                </div>
              )}

              <div className="h-60 sm:h-72 relative bg-slate-100">
                <RouteMap 
                  source={sourceCoords ? { ...sourceCoords, name: sourceName } : null}
                  destination={destCoords ? { ...destCoords, name: destName } : null}
                  routes={[]}
                  onMapClick={handleMapClick}
                />
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex justify-between items-center">
                <span>📍 Source: <strong className="text-slate-800 truncate inline-block max-w-[120px] align-bottom">{sourceName || 'Not Set'}</strong></span>
                <span>🏁 Dest: <strong className="text-slate-800 truncate inline-block max-w-[120px] align-bottom">{destName || 'Not Set'}</strong></span>
              </div>
            </div>

            {/* Journey Summary & Plan Button */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-200/90 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
                  <span className="font-extrabold text-slate-800">{vehicle}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Party</span>
                  <span className="font-extrabold text-slate-800">{travelType}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Routing Mode</span>
                  <span className="font-extrabold text-emerald-700">{preferences.length > 0 ? preferences.join(', ') : 'Optimal'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Facilities</span>
                  <span className="font-extrabold text-blue-700">{facilities.length} Selected</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlanJourney}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    <span>Finding best eco routes...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Plan Eco Journey</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default PlanJourneyPage;
