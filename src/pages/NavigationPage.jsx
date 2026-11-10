import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import RouteMap from '../components/plan-journey/RouteMap';
import Button from '../components/Button';
import { ROUTES } from '../utils/constants';
import {
  FaCompass,
  FaLocationArrow,
  FaRoute,
  FaAmbulance,
  FaTimes,
  FaCheckCircle,
  FaPlay,
  FaPause,
  FaRedo,
  FaCrosshairs,
  FaTachometerAlt,
  FaArrowUp,
  FaSatellite,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaWalking,
  FaVolumeUp,
  FaVolumeMute,
  FaPhoneAlt,
  FaWhatsapp,
  FaHospital,
  FaShieldAlt
} from 'react-icons/fa';

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(4));
}

// Compute bearing / heading angle (0-360 deg) between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

// Project a point onto a road segment with high precision
function projectPointOnSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const midLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLat);

  // Convert to meters relative to A
  const dx = (bLng - aLng) * (Math.PI / 180) * 6371000 * cosLat;
  const dy = (bLat - aLat) * (Math.PI / 180) * 6371000;

  const px = (pLng - aLng) * (Math.PI / 180) * 6371000 * cosLat;
  const py = (pLat - aLat) * (Math.PI / 180) * 6371000;

  const segLenSq = dx * dx + dy * dy;
  if (segLenSq === 0) {
    return {
      t: 0,
      distToSegMeters: Math.hypot(px, py),
      remainingSegMeters: 0,
      projLat: aLat,
      projLng: aLng
    };
  }

  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));
  const projX = t * dx;
  const projY = t * dy;
  const distToSegMeters = Math.hypot(px - projX, py - projY);
  const remainingSegMeters = Math.sqrt(segLenSq) * (1 - t);

  return {
    t,
    distToSegMeters,
    remainingSegMeters,
    projLat: aLat + t * (bLat - aLat),
    projLng: aLng + t * (bLng - aLng)
  };
}

// Calculate true remaining road distance from user GPS to destination along route polyline
function calculateRouteRemainingDistance(userLat, userLng, geometry, destLat, destLng) {
  if (!userLat || !userLng || !destLat || !destLng) return 0;
  const directDistKm = calculateDistanceKm(userLat, userLng, destLat, destLng);

  if (!geometry || geometry.length < 2) {
    return directDistKm;
  }

  let bestSegIndex = 0;
  let minDistanceToSegment = Infinity;
  let bestProj = null;

  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    const proj = projectPointOnSegment(userLat, userLng, p1[0], p1[1], p2[0], p2[1]);
    if (proj.distToSegMeters < minDistanceToSegment) {
      minDistanceToSegment = proj.distToSegMeters;
      bestSegIndex = i;
      bestProj = proj;
    }
  }

  // If user is within 20 km of the polyline, use projected road distance
  if (minDistanceToSegment < 20000 && bestProj) {
    let remainingMeters = bestProj.distToSegMeters + bestProj.remainingSegMeters;

    for (let i = bestSegIndex + 1; i < geometry.length - 1; i++) {
      const p1 = geometry[i];
      const p2 = geometry[i + 1];
      remainingMeters += calculateDistanceKm(p1[0], p1[1], p2[0], p2[1]) * 1000;
    }

    const lastPoint = geometry[geometry.length - 1];
    remainingMeters += calculateDistanceKm(lastPoint[0], lastPoint[1], destLat, destLng) * 1000;

    const remainingKm = remainingMeters / 1000;
    return parseFloat(remainingKm.toFixed(3));
  }

  return directDistKm;
}

// Google Maps distance formatter (meters when < 1 km, km when >= 1 km)
function formatDistance(distKm) {
  if (distKm == null || isNaN(distKm) || distKm <= 0.015) {
    return '0 m';
  }
  if (distKm < 1.0) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m`;
  }
  return `${distKm.toFixed(2)} km`;
}

// Duration formatter
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

// Interpolate coordinate and bearing along polyline given distance covered in km
function interpolateAlongPolyline(geometry, targetCoveredKm) {
  if (!geometry || geometry.length === 0) return null;
  if (geometry.length === 1 || targetCoveredKm <= 0) {
    const heading = geometry.length > 1 ? calculateBearing(geometry[0][0], geometry[0][1], geometry[1][0], geometry[1][1]) : 0;
    return { lat: geometry[0][0], lng: geometry[0][1], heading };
  }

  let accumulatedKm = 0;
  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    const segKm = calculateDistanceKm(p1[0], p1[1], p2[0], p2[1]);

    if (accumulatedKm + segKm >= targetCoveredKm) {
      const fraction = segKm > 0 ? (targetCoveredKm - accumulatedKm) / segKm : 0;
      const lat = p1[0] + fraction * (p2[0] - p1[0]);
      const lng = p1[1] + fraction * (p2[1] - p1[1]);
      const heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
      return { lat, lng, heading };
    }
    accumulatedKm += segKm;
  }

  // If beyond polyline end, return final point
  const lastIdx = geometry.length - 1;
  const prevIdx = Math.max(0, lastIdx - 1);
  const heading = calculateBearing(geometry[prevIdx][0], geometry[prevIdx][1], geometry[lastIdx][0], geometry[lastIdx][1]);
  return { lat: geometry[lastIdx][0], lng: geometry[lastIdx][1], heading };
}

const NavigationPage = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [journey, setJourney] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Live Navigation & Movement States (REAL DEVICE GPS LIVE BY DEFAULT!)
  const [isDriving, setIsDriving] = useState(true);
  const [navMode, setNavMode] = useState('gps'); // 'gps' (hardware live GPS) | 'drive' (simulation)
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1);
  const [currentSpeed, setCurrentSpeed] = useState(0); // in km/h
  const [followVehicle, setFollowVehicle] = useState(true);

  // Real-time Position & Progress
  const [currentLocation, setCurrentLocation] = useState(null);
  const [, setRealGpsPosition] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);

  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [etaRemaining, setEtaRemaining] = useState('');
  const [currentManeuver, setCurrentManeuver] = useState('Head straight onto route');
  const [nextTurnDistance, setNextTurnDistance] = useState('in 450 m');
  const [hasArrived, setHasArrived] = useState(false);
  const [sosAlert, setSosAlert] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [navWeather, setNavWeather] = useState(null);
  const [navAqi, setNavAqi] = useState(null);

  const simTimerRef = useRef(null);
  const geoWatchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const totalTraveledRef = useRef(0);
  const cumulativeCoveredRef = useRef(0);
  const lastSpokenManeuverRef = useRef('');
  const lastSpeechTimeRef = useRef(0);

  // Turn-by-Turn Voice Guidance (Speech Synthesis)
  const speakGuidance = useCallback((text, force = false) => {
    if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;
    const now = Date.now();
    if (!force && lastSpokenManeuverRef.current === text && now - lastSpeechTimeRef.current < 8000) {
      return;
    }
    lastSpokenManeuverRef.current = text;
    lastSpeechTimeRef.current = now;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      // browser speech error ignored
    }
  }, [voiceEnabled]);

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      const next = !prev;
      if (next) {
        speakGuidance("Voice navigation enabled", true);
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  // Turn-by-Turn Dynamic Road Driving Loop
  const updateManeuverAndEta = useCallback((liveDist, speedKmh, destName, routeTotalDist, routeDuration) => {
    if (liveDist <= 0.03) {
      const arriveMsg = `You have arrived at ${destName || 'your destination'}!`;
      setCurrentManeuver(`Arrived at ${destName || 'destination'}!`);
      setNextTurnDistance('0 m');
      setHasArrived(true);
      speakGuidance(arriveMsg, true);
      return;
    }

    // Dynamic Turn Maneuvers with voice prompts
    let spokenPhrase = '';
    if (liveDist < 0.2) {
      setCurrentManeuver(`Arriving at ${destName || 'destination'} ahead`);
      setNextTurnDistance(`in ${Math.round(liveDist * 1000)} m`);
      spokenPhrase = `In ${Math.round(liveDist * 1000)} meters, arriving at destination.`;
    } else if (liveDist < 1.0) {
      setCurrentManeuver(`Continue straight towards ${destName || 'destination'}`);
      setNextTurnDistance(`in ${Math.round(liveDist * 1000)} m`);
      spokenPhrase = `In ${Math.round(liveDist * 1000)} meters, continue straight.`;
    } else if (liveDist < 5.0) {
      setCurrentManeuver(`Follow main highway towards ${destName || 'destination'}`);
      setNextTurnDistance(`in ${liveDist.toFixed(1)} km`);
      spokenPhrase = `In ${liveDist.toFixed(1)} kilometers, follow the highway.`;
    } else {
      setCurrentManeuver(`Stay on road towards ${destName || 'destination'}`);
      setNextTurnDistance(`in ${(Math.min(5, liveDist * 0.15)).toFixed(1)} km`);
      spokenPhrase = `Continue straight towards ${destName || 'destination'}.`;
    }

    speakGuidance(spokenPhrase);

    // Live ETA Calculation
    const effectiveSpeed = speedKmh > 5 ? speedKmh : (routeTotalDist / ((routeDuration || 3600) / 3600)) || 55;
    const remainingSec = Math.max(0, (liveDist / effectiveSpeed) * 3600);
    setEtaRemaining(formatDuration(remainingSec));
  }, [speakGuidance]);

  // Advance along route by a given distance in km (used by physical hand movements or test steps)
  const advanceAlongRouteByDistance = useCallback((deltaKm, overrideHeading = null, liveSpeed = 0) => {
    if (!selectedRoute || !journey) return;
    const geometry = selectedRoute.geometry || [];
    if (geometry.length === 0) return;

    const totalDist = parseFloat(selectedRoute.distance) || 50;
    const newCovered = Math.min(totalDist, cumulativeCoveredRef.current + deltaKm);
    cumulativeCoveredRef.current = newCovered;

    const newRemaining = Math.max(0, parseFloat((totalDist - newCovered).toFixed(3)));
    setDistanceCovered(parseFloat(newCovered.toFixed(3)));
    setDistanceRemaining(newRemaining);

    // Calculate interpolated position along route polyline
    const interp = interpolateAlongPolyline(geometry, newCovered);
    if (interp) {
      const heading = overrideHeading !== null && !isNaN(overrideHeading) ? overrideHeading : interp.heading;
      setCurrentLocation({ lat: interp.lat, lng: interp.lng, heading });
    }

    updateManeuverAndEta(newRemaining, liveSpeed, journey.destination, totalDist, selectedRoute.duration);
  }, [selectedRoute, journey, updateManeuverAndEta]);

  // Initial Data Fetching
  const fetchNavigationData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let foundJourney = null;
      let foundRoute = null;

      // 1. Check state passed via navigate
      if (location.state?.journey && location.state?.selectedRoute) {
        foundJourney = location.state.journey;
        foundRoute = location.state.selectedRoute;
      }

      // 2. Check session cache
      if (!foundJourney) {
        try {
          const cached = JSON.parse(sessionStorage.getItem('active_navigation_journey'));
          if (cached && cached.journey && cached.selectedRoute) {
            foundJourney = cached.journey;
            foundRoute = cached.selectedRoute;
          }
        } catch {
          // ignore cache error
        }
      }

      // 3. Direct journey API
      if (!foundJourney && routeId) {
        try {
          const journeyData = await apiService.getJourney(routeId);
          if (journeyData && journeyData.routes && journeyData.routes.length > 0) {
            foundJourney = journeyData;
            foundRoute =
              journeyData.routes.find((r) => String(r.routeId) === String(journeyData.selectedRouteId)) ||
              journeyData.routes[0];
          }
        } catch {
          // ignore error
        }
      }

      // 4. Search all user journeys
      if (!foundJourney) {
        try {
          const userJourneys = await apiService.getUserJourneys();
          if (Array.isArray(userJourneys) && userJourneys.length > 0) {
            for (const j of userJourneys) {
              if (j.routes && j.routes.length > 0) {
                const match = j.routes.find((r) => String(r.routeId) === String(routeId));
                if (match) {
                  foundJourney = j;
                  foundRoute = match;
                  break;
                }
              }
            }

            if (!foundJourney) {
              const matchingJourney = userJourneys.find((j) => String(j.id) === String(routeId));
              if (matchingJourney && matchingJourney.routes && matchingJourney.routes.length > 0) {
                foundJourney = matchingJourney;
                foundRoute = matchingJourney.routes[0];
              }
            }

            if (!foundJourney && userJourneys[0].routes && userJourneys[0].routes.length > 0) {
              foundJourney = userJourneys[0];
              foundRoute = userJourneys[0].routes[0];
            }
          }
        } catch {
          // ignore error
        }
      }

      if (foundJourney && foundRoute) {
        // Parse facilities
        if (!foundRoute.facilities && foundRoute.facilitiesData) {
          try {
            foundRoute.facilities =
              typeof foundRoute.facilitiesData === 'string'
                ? JSON.parse(foundRoute.facilitiesData)
                : foundRoute.facilitiesData;
          } catch {
            foundRoute.facilities = [];
          }
        }

        // Fetch facilities if empty
        if ((!foundRoute.facilities || foundRoute.facilities.length === 0) && foundJourney.sourceLat && foundJourney.sourceLng) {
          apiService
            .getFacilities(foundJourney.sourceLat, foundJourney.sourceLng, 'ALL', 15.0)
            .then((facs) => {
              if (facs && facs.length > 0) {
                setSelectedRoute((prev) => ({ ...prev, facilities: facs }));
              }
            })
            .catch(() => {});
        }

        setJourney(foundJourney);
        setSelectedRoute(foundRoute);
        const totalDist = parseFloat(foundRoute.distance) || 45;
        setDistanceRemaining(totalDist);
        setDistanceCovered(0);
        cumulativeCoveredRef.current = 0;
        setEtaRemaining(formatDuration(foundRoute.duration));

        // Live weather & AQI
        if (foundRoute.weather) setNavWeather(foundRoute.weather);
        if (foundRoute.airQuality) setNavAqi(foundRoute.airQuality);
        if ((!foundRoute.weather || !foundRoute.airQuality) && (foundJourney.destLat || foundJourney.sourceLat)) {
          const lat = foundJourney.destLat || foundJourney.sourceLat;
          const lng = foundJourney.destLng || foundJourney.sourceLng;
          apiService.getWeather(lat, lng).then((w) => setNavWeather(w)).catch(() => {});
          apiService.getAirQuality(lat, lng).then((a) => setNavAqi(a)).catch(() => {});
        }

        // Initialize location to starting coordinate
        const initialPoint =
          foundRoute.geometry && foundRoute.geometry.length > 0
            ? {
                lat: foundRoute.geometry[0][0],
                lng: foundRoute.geometry[0][1],
                heading:
                  foundRoute.geometry.length > 1
                    ? calculateBearing(
                        foundRoute.geometry[0][0],
                        foundRoute.geometry[0][1],
                        foundRoute.geometry[1][0],
                        foundRoute.geometry[1][1]
                      )
                    : 0
              }
            : { lat: foundJourney.sourceLat || 28.6139, lng: foundJourney.sourceLng || 77.209, heading: 0 };

        setCurrentLocation(initialPoint);
        setIsDriving(true); // START ACTIVE NAVIGATION

        try {
          sessionStorage.setItem(
            'active_navigation_journey',
            JSON.stringify({
              journeyId: foundJourney.id,
              selectedRouteId: foundRoute.routeId,
              journey: foundJourney,
              selectedRoute: foundRoute
            })
          );
        } catch {
          // ignore error
        }
      } else {
        setError('Could not find route details for navigation.');
      }
    } catch {
      setError('Failed to load navigation data.');
    } finally {
      setLoading(false);
    }
  }, [location.state, routeId]);

  useEffect(() => {
    fetchNavigationData();
  }, [fetchNavigationData]);

  // Hardware GPS Watcher: Continuous high-accuracy tracking as user moves with mobile/laptop
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsActive(false);
      return;
    }

    const handleGpsPosition = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 10);
      let heading = pos.coords.heading;
      let speedKmh = pos.coords.speed !== null && pos.coords.speed > 0 ? Math.round(pos.coords.speed * 3.6) : 0;

      setGpsActive(true);
      setGpsAccuracy(acc);
      setRealGpsPosition({ lat, lng, heading });

      let physicalDeltaKm = 0;
      if (lastPosRef.current) {
        physicalDeltaKm = calculateDistanceKm(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
        const timeHours = (Date.now() - lastPosRef.current.time) / 3600000;

        // If physical movement > 1.5 meters detected
        if (physicalDeltaKm > 0.0015) {
          if (heading === null || isNaN(heading)) {
            heading = calculateBearing(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
          }
          if (speedKmh === 0 && timeHours > 0) {
            speedKmh = Math.min(120, Math.round(physicalDeltaKm / timeHours));
          }
          totalTraveledRef.current += physicalDeltaKm;
        }
      }
      lastPosRef.current = { lat, lng, time: Date.now() };

      if (navMode !== 'gps' || !isDriving) return;

      setCurrentSpeed(speedKmh);

      if (!selectedRoute || !journey) return;
      const geometry = selectedRoute.geometry || [];
      if (geometry.length === 0) return;

      // Check if user is physically on or near the planned route
      const distToStartKm = calculateDistanceKm(lat, lng, geometry[0][0], geometry[0][1]);
      const isNearPlannedRoute = distToStartKm < 15.0;

      if (isNearPlannedRoute) {
        // User is physically driving/walking along the actual route!
        const liveDist = calculateRouteRemainingDistance(lat, lng, geometry, journey.destLat, journey.destLng);
        setCurrentLocation({ lat, lng, heading: heading || 0 });
        setDistanceRemaining(liveDist);

        const totalDist = parseFloat(selectedRoute.distance) || liveDist;
        const covered = Math.max(0, parseFloat((totalDist - liveDist).toFixed(3)));
        setDistanceCovered(covered);
        cumulativeCoveredRef.current = covered;

        updateManeuverAndEta(liveDist, speedKmh, journey.destination, totalDist, selectedRoute.duration);
      } else {
        // User is testing with mobile or laptop in hand (e.g. indoors/college):
        // Physical walking movement delta moves the vehicle forward along the planned route!
        if (physicalDeltaKm > 0.0015) {
          advanceAlongRouteByDistance(physicalDeltaKm, heading, speedKmh);
        }
      }
    };

    // Immediate initial fix
    navigator.geolocation.getCurrentPosition(
      handleGpsPosition,
      (err) => console.warn('Initial GPS fix notice:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Continuous watch
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      handleGpsPosition,
      (err) => {
        console.warn('GPS watch error:', err.message);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 500, timeout: 15000 }
    );

    return () => {
      if (geoWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, [navMode, isDriving, selectedRoute, journey, updateManeuverAndEta, advanceAlongRouteByDistance]);

  // Simulation Auto-Drive Loop
  useEffect(() => {
    if (!isDriving || navMode !== 'drive' || !selectedRoute || !journey) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      if (!isDriving) setCurrentSpeed(0);
      return;
    }

    const totalDist = parseFloat(selectedRoute.distance) || 45;
    const stepKm = (totalDist / 120) * simSpeedMultiplier;

    simTimerRef.current = setInterval(() => {
      if (cumulativeCoveredRef.current >= totalDist) {
        setIsDriving(false);
        setCurrentSpeed(0);
        setDistanceRemaining(0);
        setDistanceCovered(totalDist);
        setHasArrived(true);
        clearInterval(simTimerRef.current);
        return;
      }

      // Cruising speed 50-65 km/h
      const liveKmh = Math.floor(52 + Math.sin(cumulativeCoveredRef.current * 2) * 8 + Math.random() * 4);
      setCurrentSpeed(Math.min(120, liveKmh * simSpeedMultiplier));

      advanceAlongRouteByDistance(stepKm, null, liveKmh);
    }, 1000);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isDriving, navMode, simSpeedMultiplier, selectedRoute, journey, advanceAlongRouteByDistance]);

  // Step closer button for testing indoors/desktop (+20m or +100m)
  const handleTestStep = (meters) => {
    const deltaKm = meters / 1000;
    advanceAlongRouteByDistance(deltaKm, null, 4); // ~4 km/h walking speed
  };

  // Snap directly to real GPS coordinates
  const handleSnapToGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading || 0
        };
        setRealGpsPosition(coords);
        setCurrentLocation(coords);
        setNavMode('gps');
        setIsDriving(true);

        if (selectedRoute && journey?.destLat && journey?.destLng) {
          const liveDist = calculateRouteRemainingDistance(
            coords.lat,
            coords.lng,
            selectedRoute.geometry || [],
            journey.destLat,
            journey.destLng
          );
          setDistanceRemaining(liveDist);
          const totalDist = parseFloat(selectedRoute.distance) || liveDist;
          const covered = Math.max(0, parseFloat((totalDist - liveDist).toFixed(3)));
          setDistanceCovered(covered);
          cumulativeCoveredRef.current = covered;
          updateManeuverAndEta(liveDist, 0, journey.destination, totalDist, selectedRoute.duration);
        }
      },
      (err) => {
        alert('Could not retrieve current location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const toggleDriving = () => {
    setIsDriving((prev) => !prev);
  };

  const resetJourney = () => {
    cumulativeCoveredRef.current = 0;
    setHasArrived(false);
    setIsDriving(true);
    if (selectedRoute) {
      const totalDist = parseFloat(selectedRoute.distance) || 0;
      setDistanceRemaining(totalDist);
      setDistanceCovered(0);
      setEtaRemaining(formatDuration(selectedRoute.duration));
      if (selectedRoute.geometry && selectedRoute.geometry.length > 0) {
        const p1 = selectedRoute.geometry[0];
        const p2 = selectedRoute.geometry[1] || p1;
        setCurrentLocation({
          lat: p1[0],
          lng: p1[1],
          heading: calculateBearing(p1[0], p1[1], p2[0], p2[1])
        });
      }
    }
  };

  const handleEndNavigation = () => {
    if (window.confirm('Are you sure you want to end your active navigation session?')) {
      try {
        sessionStorage.removeItem('active_navigation_journey');
      } catch {
        // ignore error
      }
      navigate(ROUTES.DASHBOARD);
    }
  };

  const triggerSos = () => {
    setSosAlert(true);
    setSosModalOpen(true);
    speakGuidance("Emergency SOS activated. Broadcast alert and emergency numbers are ready.", true);
  };

  const generateWhatsAppSosUrl = () => {
    const lat = currentLocation?.lat || journey?.sourceLat || 0;
    const lng = currentLocation?.lng || journey?.sourceLng || 0;
    const msg = `🚨 *EMERGENCY SOS ALERT from EcoRoute* 🚨\n\n` +
      `👤 *Traveler:* ${user?.fullName || 'EcoRoute User'}\n` +
      `🏁 *Destination:* ${journey?.destination || 'N/A'}\n` +
      `⚡ *Speed:* ${currentSpeed} km/h | *Remaining:* ${distanceRemaining.toFixed(1)} km\n\n` +
      `📍 *LIVE GPS LOCATION*:\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}\n\n` +
      `🗺️ *Open on Google Maps*:\nhttps://maps.google.com/?q=${lat},${lng}\n\n` +
      `⏰ *Time:* ${new Date().toLocaleTimeString()}\n` +
      `⚠️ *Please send immediate medical / roadside assistance!*`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  const nearestHospital = (selectedRoute?.facilities || []).find(
    f => f.type && (f.type.toUpperCase().includes('HOSPITAL') || f.type.toUpperCase().includes('CLINIC') || f.type.toUpperCase().includes('HEALTH'))
  );

  const rerouteToNearestHospital = () => {
    if (!nearestHospital) return;
    setSosModalOpen(false);
    speakGuidance(`Rerouting immediately to nearest hospital: ${nearestHospital.name}`, true);
    alert(`Emergency Detour Set: Rerouting towards ${nearestHospital.name} (${nearestHospital.distance || '1.2'} km away).`);
  };

  const totalDistNumber = parseFloat(selectedRoute?.distance) || 100;
  const progressPercent = Math.min(100, Math.round((distanceCovered / totalDistNumber) * 100));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10 animate-bounce">
            <FaCompass />
          </div>
          <p className="text-xl font-black text-slate-800 tracking-tight">Starting Live Navigation...</p>
          <p className="text-xs text-slate-500 font-medium">Connecting live GPS satellites and road sensor telemetry</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !journey || !selectedRoute) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-md border border-rose-200">
            <FaExclamationTriangle />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Navigation Route Unavailable</h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">{error}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button variant="primary" size="md" icon={FaRoute} onClick={() => navigate(ROUTES.PLAN_JOURNEY)}>
              Plan a New Journey
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      
      {/* 1. TOP LIVE COCKPIT CONTROLS */}
      <div className="bg-slate-900/95 backdrop-blur-xl text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center z-20 shadow-xl gap-3">
        
        {/* Left: Live Status Beacon & Destination */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
              <FaLocationArrow className="rotate-45" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                LIVE NAVIGATING
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {navMode === 'gps' ? '🛰️ Real Device GPS' : '🚗 Auto-Drive Simulation'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight truncate max-w-sm sm:max-w-md mt-0.5">
              {journey.destination}
            </h1>
          </div>
        </div>

        {/* Center: Real-Time Digital Speedometer & Live Distance HUD */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2.5">
            <FaTachometerAlt className={`${currentSpeed > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} text-xl`} />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentSpeed}
                </span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">KM/H</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 block -mt-1">
                {currentSpeed > 0 ? '🟢 Real-Time Motion' : '⚪ Stationary'}
              </span>
            </div>
          </div>

          <div className="hidden md:block h-9 w-[1px] bg-slate-800" />

          {/* Real Google Maps Distance Countdown (adapts to meters / km) */}
          <div className="hidden md:flex flex-col text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">To Destination</span>
            <span className="text-base font-black text-white tracking-tight">
              {formatDistance(distanceRemaining)}
            </span>
          </div>

          <div className="hidden md:block h-9 w-[1px] bg-slate-800" />

          {/* Live ETA */}
          <div className="hidden md:flex flex-col text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Live ETA</span>
            <span className="text-base font-black text-teal-400">{etaRemaining}</span>
          </div>

          {/* Live Environmental Telemetry (Weather & AQI) */}
          {navWeather && (
            <>
              <div className="hidden lg:block h-9 w-[1px] bg-slate-800" />
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="text-sky-300 font-bold flex items-center gap-1" title={navWeather.weatherCondition}>
                  <span>🌤️</span> {Math.round(navWeather.temperature)}°C
                </span>
                {navAqi && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    navAqi.aqi <= 50 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                      : navAqi.aqi <= 100 
                        ? 'bg-amber-950 text-amber-400 border-amber-800' 
                        : 'bg-orange-950 text-orange-400 border-orange-800'
                  }`}>
                    🌿 AQI {navAqi.aqi}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Driving Controls */}
        <div className="flex items-center gap-2.5">
          {/* Pause / Resume */}
          <button
            onClick={toggleDriving}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg ${
              isDriving
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isDriving ? (
              <>
                <FaPause /> <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <FaPlay /> <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-[11px] font-bold">
            <button
              onClick={() => {
                setNavMode('gps');
                handleSnapToGps();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                navMode === 'gps' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Track physical phone/laptop movements in hand"
            >
              🛰️ Real Device GPS
            </button>
            <button
              onClick={() => {
                setNavMode('drive');
                setIsDriving(true);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                navMode === 'drive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Continuous road simulation"
            >
              🚗 Auto-Drive
            </button>
          </div>

          {/* Quick Walking Step Test Button (ideal for indoor testing on laptop/mobile) */}
          <button
            onClick={() => handleTestStep(20)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs border border-blue-500 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            title="Step 20 meters closer towards destination"
          >
            <FaWalking />
            <span>+20m Step</span>
          </button>

          {/* Speed Multiplier for Auto-Drive */}
          {navMode === 'drive' && (
            <select
              value={simSpeedMultiplier}
              onChange={(e) => setSimSpeedMultiplier(Number(e.target.value))}
              className="bg-slate-800 text-emerald-400 text-xs font-black rounded-xl px-2 py-2 border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
            </select>
          )}

          {/* Voice Guidance Toggle */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title={voiceEnabled ? 'Voice Guidance Active (click to mute)' : 'Voice Guidance Muted (click to enable)'}
          >
            {voiceEnabled ? <FaVolumeUp className="text-sm animate-pulse" /> : <FaVolumeMute className="text-sm" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          <Button
            variant="danger"
            size="sm"
            onClick={triggerSos}
            icon={FaAmbulance}
            className="shadow-rose-600/30 font-black text-xs cursor-pointer"
          >
            SOS
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndNavigation}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
          >
            End
          </Button>
        </div>

      </div>

      {/* SOS Alert Banner */}
      {sosAlert && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between z-30 animate-pulse">
          <span className="flex items-center gap-2">
            <FaAmbulance className="text-base" /> Emergency SOS Active! Click the Emergency Center below or dispatch live location.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-2.5 py-1 bg-white text-rose-700 rounded-md font-extrabold hover:bg-rose-50 cursor-pointer text-[11px]"
            >
              Open Center
            </button>
            <button onClick={() => setSosAlert(false)} className="text-white hover:text-rose-200 cursor-pointer">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* 🚨 COMPREHENSIVE EMERGENCY SOS DISPATCH CENTER MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl shadow-rose-900/50 space-y-5 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl animate-pulse shadow-lg shadow-rose-600/40">
                  <FaAmbulance />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    Emergency Response Center
                  </h2>
                  <p className="text-xs text-rose-300 font-medium">Instant broadcast & nearest medical assistance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Live GPS Telemetry Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FaCrosshairs className="text-rose-400" /> Current Coordinates
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {currentLocation ? `${currentLocation.lat.toFixed(5)}°, ${currentLocation.lng.toFixed(5)}°` : 'Acquiring GPS...'}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                <span className="text-slate-500">Destination:</span> <b>{journey?.destination || 'N/A'}</b>
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
                <span>Speed: <b className="text-white">{currentSpeed} km/h</b></span>
                <span>Remaining: <b className="text-white">{distanceRemaining.toFixed(1)} km</b></span>
              </div>
            </div>

            {/* Primary Action: One-Click WhatsApp Dispatch */}
            <div>
              <a
                href={generateWhatsAppSosUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 transition-all text-sm uppercase tracking-wider group"
              >
                <FaWhatsapp className="text-xl text-emerald-200 group-hover:scale-110 transition-transform" />
                Broadcast SOS via WhatsApp
              </a>
              <p className="text-[11px] text-slate-400 text-center mt-1.5">Sends emergency message with Google Maps coordinates link</p>
            </div>

            {/* Quick Speed-Dial Numbers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Emergency Hotlines</span>
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href="tel:108"
                  className="bg-slate-800/90 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/50 p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <FaAmbulance className="text-rose-400 text-lg mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-white">Ambulance</span>
                  <span className="text-[10px] text-rose-400 font-bold">108</span>
                </a>

                <a
                  href="tel:112"
                  className="bg-slate-800/90 hover:bg-amber-950/50 border border-slate-700 hover:border-amber-500/50 p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <FaShieldAlt className="text-amber-400 text-lg mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-white">National</span>
                  <span className="text-[10px] text-amber-400 font-bold">112</span>
                </a>

                <a
                  href="tel:100"
                  className="bg-slate-800/90 hover:bg-blue-950/50 border border-slate-700 hover:border-blue-500/50 p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <FaPhoneAlt className="text-blue-400 text-lg mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-white">Police</span>
                  <span className="text-[10px] text-blue-400 font-bold">100</span>
                </a>
              </div>
            </div>

            {/* Nearest Hospital Detour (if available) */}
            {nearestHospital && (
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center text-base">
                    <FaHospital />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[200px]">{nearestHospital.name}</div>
                    <div className="text-[10px] text-rose-300">Nearest Medical ({nearestHospital.distance ? `${nearestHospital.distance} km` : 'Close by'})</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={rerouteToNearestHospital}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Reroute
                </button>
              </div>
            )}

            {/* Dismiss */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all text-center cursor-pointer"
              >
                Close Emergency Center
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Destination Arrival Celebration Banner */}
      {hasArrived && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-sm font-black flex items-center justify-between z-30 shadow-xl border-b border-emerald-500 animate-bounce">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-2xl text-white" />
            <div>
              <p className="text-base">🎉 You have arrived at {journey.destination}!</p>
              <p className="text-xs font-medium text-emerald-100">Total Distance: {formatDistance(distanceCovered)} completed.</p>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="px-4 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-extrabold hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            View Dashboard
          </button>
        </div>
      )}

      {/* 2. MAIN COCKPIT: TURN-BY-TURN HUD + LIVE INTERACTIVE MAP */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        
        {/* Left Side: Real-Time Driving HUD Panel */}
        <div className="w-full md:w-96 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 text-white flex flex-col shadow-2xl z-10 h-2/5 md:h-full">
          
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* Live Progress Bar with Meter-by-Meter Updates */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Route Completion
                </span>
                <span className="text-emerald-400 font-black">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 font-bold pt-0.5">
                <span>{formatDistance(distanceCovered)} traveled</span>
                <span className="text-emerald-400">{formatDistance(distanceRemaining)} left</span>
              </div>
            </div>

            {/* Live Google Maps Turn-by-Turn Maneuver Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FaLocationArrow className="rotate-45" /> Live Direction
                </span>
                <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {nextTurnDistance}
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/40 shrink-0">
                  <FaArrowUp />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                    {currentManeuver}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    Towards {journey.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Real-Time GPS Telemetry & Hand Movement Detection Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaSatellite className="text-emerald-400" />
                  REAL-TIME GPS TELEMETRY
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {gpsActive ? `±${gpsAccuracy || 5}m Accuracy` : 'Satellite Fix Active'}
                </span>
              </div>
              
              <p className="text-xs font-mono font-bold text-slate-200">
                {currentLocation?.lat ? currentLocation.lat.toFixed(5) : '0.00000'}° N,{' '}
                {currentLocation?.lng ? currentLocation.lng.toFixed(5) : '0.00000'}° E
              </p>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">📱</span>
                <div>
                  <span className="font-bold text-white block">Hand / Device Motion Sync:</span>
                  <span>Move your mobile or laptop in hand — real distance counts down dynamically as you advance towards {journey.destination}!</span>
                </div>
              </div>

              {/* Indoor testing step controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleTestStep(20)}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Test: Walk 20 meters closer"
                >
                  <FaWalking />
                  <span>Walk 20m</span>
                </button>
                <button
                  onClick={() => handleTestStep(100)}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Test: Move 100 meters closer"
                >
                  <FaWalking />
                  <span>Move 100m</span>
                </button>
              </div>

              <button
                onClick={handleSnapToGps}
                className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <FaCrosshairs className="text-emerald-400" />
                <span>Sync with My Exact Phone/Device Location</span>
              </button>
            </div>

            {/* Real Facilities Along Route (Hospitals, Restaurants, Hotels, Fuel) */}
            {selectedRoute?.facilities && selectedRoute.facilities.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-emerald-400">
                    <FaMapMarkerAlt /> Places Along Route
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {selectedRoute.facilities.length} Places
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {selectedRoute.facilities.slice(0, 6).map((fac, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2 text-xs hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-base shrink-0">
                          {fac.type === 'HOSPITAL' ? '🏥' : fac.type === 'HOTEL' ? '🏨' : fac.type === 'RESTAURANT' ? '🍽️' : fac.type === 'FUEL_STATION' ? '⛽' : '📍'}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-slate-200 truncate">{fac.name}</p>
                          <p className="text-[10px] text-slate-400">{fac.type?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {fac.distance && (
                        <span className="text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900">
                          {fac.distance} km
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Floating Map View Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2.5">
            <button
              onClick={() => setFollowVehicle(!followVehicle)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                followVehicle
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FaCrosshairs />
              <span>{followVehicle ? 'Camera Following' : 'Free Camera'}</span>
            </button>

            <button
              onClick={resetJourney}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Reset Route to Start"
            >
              <FaRedo />
            </button>
          </div>

        </div>

        {/* Right Side: Full Screen Map with Live Moving Vehicle Marker */}
        <div className="flex-1 relative z-0 h-3/5 md:h-full bg-slate-950">
          <RouteMap
            source={{ lat: journey.sourceLat || 0, lng: journey.sourceLng || 0, name: journey.source }}
            destination={{ lat: journey.destLat || 0, lng: journey.destLng || 0, name: journey.destination }}
            routes={[selectedRoute]}
            selectedRouteId={selectedRoute.routeId}
            facilities={selectedRoute.facilities || []}
            livePosition={currentLocation}
            followVehicle={followVehicle}
            aqiData={navAqi}
          />
        </div>

      </div>
    </div>
  );
};

export default NavigationPage;
