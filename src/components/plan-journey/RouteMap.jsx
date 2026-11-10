import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const formatDuration = (seconds) => {
  if (!seconds) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
};

const getAqiColor = (aqi) => {
  if (aqi == null) return '#10b981';
  if (aqi <= 50) return '#10b981'; // Good (Emerald)
  if (aqi <= 100) return '#f59e0b'; // Moderate (Amber)
  if (aqi <= 150) return '#f97316'; // Unhealthy for Sensitive (Orange)
  if (aqi <= 200) return '#ef4444'; // Unhealthy (Red)
  return '#991b1b'; // Hazardous (Dark Maroon)
};

const getAqiCategory = (aqi) => {
  if (aqi == null) return 'Good';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy (Sens.)';
  if (aqi <= 200) return 'Unhealthy';
  return 'Hazardous';
};

const RouteMap = ({
  source,
  destination,
  routes,
  selectedRouteId,
  onRouteSelect,
  facilities = [],
  livePosition = null,
  followVehicle = false,
  onMapClick = null,
  aqiData = null
}) => {
  const [mapMode, setMapMode] = React.useState('standard'); // 'standard' | 'aqi'
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayers = useRef({});
  const liveMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India center
      // Use Google Maps Standard Tiles with https and subdomains for fast, crisp rendering
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Map Click Listener
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const handleMapClick = (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onMapClick]);

  // Update Markers and Routes
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing layers
    Object.values(routeLayers.current).forEach(layer => map.removeLayer(layer));
    routeLayers.current = {};

    // Remove old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds();

    if (source && source.lat && source.lng) {
      const sourceLabel = source.name ? source.name.split(',')[0].trim() : '';
      const sourceIcon = L.divIcon({
        className: 'google-maps-origin-marker',
        html: `
          <div style="display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;user-select:none;transform:translate(0, 0);">
            <div style="
              width: 15px;
              height: 15px;
              background-color: #ffffff;
              border: 3.5px solid #202124;
              border-radius: 50%;
              box-shadow: 0 1px 4px rgba(0,0,0,0.45);
              flex-shrink: 0;
            "></div>
            ${sourceLabel ? `
              <span style="
                font-family: Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                font-size: 13px;
                font-weight: 600;
                color: #202124;
                text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 1px 3px rgba(255,255,255,0.9);
                letter-spacing: 0.2px;
              ">${sourceLabel}</span>
            ` : ''}
          </div>
        `,
        iconSize: [sourceLabel ? 160 : 16, 20],
        iconAnchor: [7.5, 7.5], // Exact center of the 15px circle
        popupAnchor: [0, -10]
      });

      L.marker([source.lat, source.lng], { icon: sourceIcon, zIndexOffset: 800 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Roboto, Arial, sans-serif; font-size:12px; padding:3px;">
            <div style="font-weight:800; color:#202124; display:flex; align-items:center; gap:5px; margin-bottom:2px;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#fff; border:2.5px solid #202124;"></span> Starting Point
            </div>
            <div style="color:#202124; font-weight:600; font-size:12px;">${source.name || 'Start Location'}</div>
            <div style="color:#5f6368; font-size:10.5px; font-family:monospace; margin-top:2px;">${source.lat.toFixed(5)}°, ${source.lng.toFixed(5)}°</div>
          </div>
        `);
      bounds.extend([source.lat, source.lng]);
    }

    if (destination && destination.lat && destination.lng) {
      const destLabel = destination.name ? destination.name.split(',')[0].trim() : '';
      const destIcon = L.divIcon({
        className: 'google-maps-dest-marker',
        html: `
          <div style="display:flex;align-items:flex-start;gap:6px;cursor:pointer;white-space:nowrap;user-select:none;">
            <div style="position:relative;width:28px;height:38px;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.4));flex-shrink:0;">
              <svg viewBox="0 0 28 38" width="28" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Soft ground shadow under tip -->
                <ellipse cx="14" cy="37" rx="4.5" ry="1.2" fill="rgba(0,0,0,0.3)"/>
                <!-- Classic Google Maps Red Teardrop -->
                <path d="M14 1C6.82 1 1 6.82 1 14C1 23.8 14 36.5 14 36.5C14 36.5 27 23.8 27 14C27 6.82 21.18 1 14 1Z" fill="#EA4335" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
                <!-- Google Maps Solid Dark Inner Dot -->
                <circle cx="14" cy="14" r="5" fill="#202124"/>
              </svg>
            </div>
            ${destLabel ? `
              <span style="
                font-family: Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                font-size: 13px;
                font-weight: 600;
                color: #202124;
                text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 1px 3px rgba(255,255,255,0.9);
                letter-spacing: 0.2px;
                margin-top: 4px;
              ">${destLabel}</span>
            ` : ''}
          </div>
        `,
        iconSize: [destLabel ? 160 : 28, 38],
        iconAnchor: [14, 36.5], // Exact bottom tip of the pin
        popupAnchor: [0, -38]
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon, zIndexOffset: 900 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Roboto, Arial, sans-serif; font-size:12px; padding:3px;">
            <div style="font-weight:800; color:#EA4335; display:flex; align-items:center; gap:5px; margin-bottom:2px;">
              <span>📍</span> Destination
            </div>
            <div style="color:#202124; font-weight:600; font-size:12px;">${destination.name || 'Destination'}</div>
            <div style="color:#5f6368; font-size:10.5px; font-family:monospace; margin-top:2px;">${destination.lat.toFixed(5)}°, ${destination.lng.toFixed(5)}°</div>
          </div>
        `);
      bounds.extend([destination.lat, destination.lng]);
    }

    // Add facilities with exact Google Maps style
    if (facilities && facilities.length > 0) {
      facilities.forEach(facility => {
        if (facility.latitude && facility.longitude) {
          let bgColor = '#4285f4'; // Google Blue
          let textColor = '#3c4043'; // Google Gray
          let iconSymbol = '📍';
          const type = facility.type ? facility.type.toUpperCase() : '';
          
          if (type === 'HOSPITAL') { bgColor = '#ea4335'; textColor = '#ea4335'; iconSymbol = 'H'; }
          else if (type === 'HOTEL') { bgColor = '#4285f4'; iconSymbol = '🛏'; }
          else if (type === 'RESTAURANT') { bgColor = '#ff9800'; textColor = '#d97706'; iconSymbol = '🍴'; }
          else if (type === 'GARAGE') { bgColor = '#8ab4f8'; iconSymbol = '🔧'; }
          else if (type === 'FUEL_STATION') { bgColor = '#8ab4f8'; iconSymbol = '⛽'; }
          else if (type === 'EV_CHARGING') { bgColor = '#34a853'; textColor = '#0d652d'; iconSymbol = '⚡'; }

          const customIcon = L.divIcon({
             html: `
               <div style="display: flex; align-items: center; gap: 4px; transform: translate(-10px, -10px);">
                 <div style="
                   background-color: ${bgColor}; 
                   color: white; 
                   border-radius: 50%; 
                   width: 20px; 
                   height: 20px; 
                   display: flex; 
                   align-items: center; 
                   justify-content: center; 
                   font-size: 11px; 
                   font-weight: bold;
                   box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                   border: 1px solid white;
                 ">${iconSymbol}</div>
                 <div style="
                   font-size: 11px;
                   font-weight: 500;
                   color: ${textColor};
                   text-shadow: 
                     -1.5px -1.5px 0 #fff,  
                      1.5px -1.5px 0 #fff,
                     -1.5px  1.5px 0 #fff,
                      1.5px  1.5px 0 #fff,
                      0px 1px 2px rgba(0,0,0,0.2);
                   white-space: nowrap;
                   font-family: Roboto, Arial, sans-serif;
                   letter-spacing: 0.2px;
                   cursor: pointer;
                 ">${facility.name}</div>
               </div>
             `,
             className: '', 
             iconSize: [0, 0], 
             iconAnchor: [0, 0]
          });
          
          const marker = L.marker([facility.latitude, facility.longitude], { icon: customIcon }).addTo(map);
          bounds.extend([facility.latitude, facility.longitude]);
        }
      });
    }

    if (routes && routes.length > 0) {
      // 1. Render alternative unselected routes first in Google Maps slate gray
      routes.forEach((route) => {
        if (!route.geometry || route.geometry.length === 0) return;
        const isSelected = selectedRouteId === route.routeId;
        if (isSelected) return; // Render active route on top later

        // Alternative route casing (white halo)
        const altCasing = L.polyline(route.geometry, {
          color: '#ffffff',
          weight: 7.5,
          opacity: 0.7,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(map);

        // Alternative route core line (Google Maps gray)
        const altCore = L.polyline(route.geometry, {
          color: '#80868b',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(map);

        const altGroup = L.featureGroup([altCasing, altCore]);
        altGroup.on('click', () => {
          if (onRouteSelect) onRouteSelect(route.routeId);
        });

        routeLayers.current[route.routeId] = altGroup;
        bounds.extend(altCasing.getBounds());

        // Floating Google Maps ETA badge on alternative route (white pill)
        if (route.geometry.length > 4 && (route.duration || route.distance)) {
          const midPt = route.geometry[Math.floor(route.geometry.length * 0.42)];
          const durText = formatDuration(route.duration);
          const distText = route.distance ? `${route.distance} km` : '';

          const altBadgeIcon = L.divIcon({
            className: 'google-maps-alt-badge',
            html: `
              <div style="
                background: #ffffff;
                color: #3c4043;
                border: 1px solid #dadce0;
                padding: 4px 8px;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.22);
                font-family: Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                text-align: center;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
                transform: translate(-50%, -50%);
              ">
                <div style="font-size: 11px; font-weight: 700; color: #3c4043; display: flex; align-items: center; justify-content: center; gap: 3px;">
                  <span style="font-size: 10px;">🚗</span> ${durText}
                </div>
                ${distText ? `<div style="font-size: 10px; font-weight: 500; color: #70757a; margin-top: 1px;">${distText}</div>` : ''}
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          const altMarker = L.marker([midPt[0], midPt[1]], { icon: altBadgeIcon, zIndexOffset: 400 }).addTo(map);
          altMarker.on('click', () => {
            if (onRouteSelect) onRouteSelect(route.routeId);
          });
        }
      });

      // 2. Render active selected route
      const activeRoute = routes.find(r => r.routeId === selectedRouteId) || routes[0];
      if (activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0) {
        const activeLayers = [];
        const baseAqi = typeof aqiData === 'number' ? aqiData : (aqiData?.aqi || 48);

        if (mapMode === 'aqi' && activeRoute.geometry.length >= 4) {
          // Render dynamic AQI Color-Coded Segments
          const geom = activeRoute.geometry;
          const numSegs = Math.min(5, Math.max(3, Math.floor(geom.length / 10)));
          
          for (let i = 0; i < numSegs; i++) {
            const startIdx = Math.floor((i / numSegs) * (geom.length - 1));
            const endIdx = Math.min(geom.length, Math.floor(((i + 1) / numSegs) * (geom.length - 1)) + 1);
            const segGeom = geom.slice(startIdx, endIdx);
            if (segGeom.length < 2) continue;

            // Environmental gradient calculation along journey path
            const factor = Math.sin((i / (numSegs - 1 || 1)) * Math.PI);
            const segAqi = Math.max(15, Math.round(baseAqi + (factor * 38) - 10));
            const color = getAqiColor(segAqi);
            const cat = getAqiCategory(segAqi);

            const segCasing = L.polyline(segGeom, {
              color: '#0f172a',
              weight: 9,
              opacity: 0.85,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(map);

            const segCore = L.polyline(segGeom, {
              color: color,
              weight: 6,
              opacity: 1,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(map);

            segCore.bindTooltip(`
              <div style="font-family:Roboto, Arial, sans-serif; font-size:11px; padding:2px;">
                <b style="color:${color};">AQI ${segAqi}</b> &bull; ${cat}
              </div>
            `, { sticky: true, className: 'aqi-segment-tooltip' });

            activeLayers.push(segCasing, segCore);
            bounds.extend(segCasing.getBounds());
          }

          // Mid-route AQI Milestone badge
          const midPt = geom[Math.floor(geom.length * 0.5)];
          const midAqi = Math.max(20, Math.round(baseAqi + 18));
          const midColor = getAqiColor(midAqi);
          const aqiBadgeIcon = L.divIcon({
            className: 'google-maps-aqi-badge',
            html: `
              <div style="
                background: ${midColor};
                color: #ffffff;
                padding: 4px 8px;
                border-radius: 9999px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.35);
                border: 2px solid #ffffff;
                font-family: Roboto, -apple-system, sans-serif;
                font-size: 11px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
                transform: translate(-50%, -50%);
              ">
                <span>🍃</span> AQI ${midAqi} (${getAqiCategory(midAqi)})
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });
          const aqiMarker = L.marker([midPt[0], midPt[1]], { icon: aqiBadgeIcon, zIndexOffset: 700 }).addTo(map);
          activeLayers.push(aqiMarker);

        } else {
          // Standard Google Maps Electric Blue line
          const casing = L.polyline(activeRoute.geometry, {
            color: '#1557b0',
            weight: 8.5,
            opacity: 0.92,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);

          const core = L.polyline(activeRoute.geometry, {
            color: '#1a73e8',
            weight: 5.5,
            opacity: 1,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);

          casing.bringToFront();
          core.bringToFront();
          activeLayers.push(casing, core);
          bounds.extend(casing.getBounds());
        }

        const activeGroup = L.featureGroup(activeLayers);
        activeGroup.on('click', () => {
          if (onRouteSelect) onRouteSelect(activeRoute.routeId);
        });

        routeLayers.current[activeRoute.routeId] = activeGroup;

        // Floating Google Maps ETA badge on active route
        if (activeRoute.geometry.length > 4 && (activeRoute.duration || activeRoute.distance)) {
          const midPt = activeRoute.geometry[Math.floor(activeRoute.geometry.length * 0.48)];
          const durText = formatDuration(activeRoute.duration);
          const distText = activeRoute.distance ? `${activeRoute.distance} km` : '';
          const badgeBg = mapMode === 'aqi' ? '#047857' : '#1a73e8';

          const activeBadgeIcon = L.divIcon({
            className: 'google-maps-active-badge',
            html: `
              <div style="
                background: ${badgeBg};
                color: #ffffff;
                padding: 4px 9px;
                border-radius: 8px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                font-family: Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                text-align: center;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
                transform: translate(-50%, -50%);
              ">
                <div style="font-size: 11.5px; font-weight: 700; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  <span style="font-size: 10px;">${mapMode === 'aqi' ? '🌿' : '🚗'}</span> ${durText}
                </div>
                ${distText ? `<div style="font-size: 10px; font-weight: 500; opacity: 0.95; margin-top: 1px;">${distText}</div>` : ''}
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          const activeMarker = L.marker([midPt[0], midPt[1]], { icon: activeBadgeIcon, zIndexOffset: 600 }).addTo(map);
          activeMarker.on('click', () => {
            if (onRouteSelect) onRouteSelect(activeRoute.routeId);
          });
        }
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Fix Leaflet rendering issues in React
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [source, destination, routes, selectedRouteId, onRouteSelect, facilities, mapMode, aqiData]);

  // Handle dynamic live vehicle position updates
  useEffect(() => {
    if (!mapInstance.current || !livePosition || livePosition.lat === undefined || livePosition.lng === undefined) return;
    const map = mapInstance.current;

    const heading = livePosition.heading || 0;
    const vehicleIcon = L.divIcon({
      className: 'google-maps-vehicle-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; user-select: none;">
          <!-- Soft radar pulse beam -->
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(26, 115, 232, 0.25); border-radius: 50%; animation: pulse-ring 2s infinite ease-out;"></div>
          <!-- Google Maps Navigation Arrow in Disc -->
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            background: #ffffff;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${heading}deg);
            transition: transform 0.2s ease;
          ">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#1a73e8">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!liveMarkerRef.current) {
      liveMarkerRef.current = L.marker([livePosition.lat, livePosition.lng], {
        icon: vehicleIcon,
        zIndexOffset: 1000
      }).addTo(map).bindPopup('<b>Current Device Location</b><br>Live GPS Navigation');
    } else {
      liveMarkerRef.current.setIcon(vehicleIcon);
      liveMarkerRef.current.setLatLng([livePosition.lat, livePosition.lng]);
    }

    if (followVehicle) {
      map.panTo([livePosition.lat, livePosition.lng], { animate: true, duration: 0.5 });
    }
  }, [livePosition, followVehicle]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      <div 
        ref={mapRef} 
        className="absolute inset-0 rounded-lg shadow-sm border border-gray-200 z-0"
      ></div>

      {/* Mode Switcher Floating Pill on Map */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMapMode('standard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mapMode === 'standard'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Classic Road View"
        >
          <span>🗺️</span> Standard
        </button>
        <button
          type="button"
          onClick={() => setMapMode('aqi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mapMode === 'aqi'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Eco & Air Quality Color-Coded Route"
        >
          <span>🌿</span> AQI Heatmap
        </button>
      </div>

      {/* Floating AQI Scale Legend when Heatmap mode is selected */}
      {mapMode === 'aqi' && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 max-w-[230px] animate-fade-in">
          <div className="font-bold flex items-center justify-between text-[11px] text-emerald-400">
            <span className="flex items-center gap-1">🌿 Route AQI Zones</span>
            <span className="text-[10px] text-slate-400">US AQI</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
            <div className="bg-emerald-500 text-white rounded px-1 py-0.5" title="Good (0-50)">0-50</div>
            <div className="bg-amber-500 text-white rounded px-1 py-0.5" title="Moderate (51-100)">51-100</div>
            <div className="bg-orange-500 text-white rounded px-1 py-0.5" title="Unhealthy for Sensitive (101-150)">101-150</div>
            <div className="bg-rose-500 text-white rounded px-1 py-0.5" title="Unhealthy (>150)">&gt;150</div>
          </div>
          <div className="text-[9.5px] text-slate-300 flex justify-between pt-0.5">
            <span className="text-emerald-400 font-semibold">Clean Air</span>
            <span className="text-rose-400 font-semibold">Polluted</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
