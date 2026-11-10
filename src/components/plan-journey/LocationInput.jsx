import React, { useState, useEffect, useRef } from 'react';
import { POPULAR_LOCATIONS } from '../../utils/popularLocations';
import { FaMapMarkerAlt, FaTimes, FaSearch, FaHistory, FaCheckCircle, FaCompass } from 'react-icons/fa';

const LocationInput = ({ label, value, onChange, placeholder, onGeocode, coords = null }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce API calls for autocomplete combining Curated Dataset + Photon Map API + Nominatim
  useEffect(() => {
    if (!value || value.length < 2 || !isTyping) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const query = value.trim().toLowerCase();

      // 1. Instant match from Curated Popular Google Maps Landmarks dataset
      const localMatches = POPULAR_LOCATIONS.filter(loc => 
        loc.name.toLowerCase().includes(query) || 
        loc.shortName.toLowerCase().includes(query)
      ).map(loc => ({
        id: `local-${loc.lat}-${loc.lng}`,
        title: loc.shortName,
        subtitle: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        category: loc.category,
        icon: loc.icon || '📍',
        isCurated: true
      }));

      // 2. Fetch live data from Photon Geocoding API (Fast OpenStreetMap / Google Maps alternative)
      let remoteMatches = [];
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.features) {
            remoteMatches = data.features.map((feat, idx) => {
              const p = feat.properties || {};
              const title = p.name || p.city || p.street || query;
              const subtitleParts = [p.street, p.city, p.state, p.country].filter(Boolean);
              const subtitle = subtitleParts.join(', ') || p.name || 'Location on Map';
              return {
                id: `photon-${idx}-${feat.geometry.coordinates[0]}`,
                title: title,
                subtitle: subtitle,
                lat: feat.geometry.coordinates[1],
                lng: feat.geometry.coordinates[0],
                category: p.osm_value ? p.osm_value.replace('_', ' ') : (p.type || 'Place'),
                icon: p.osm_key === 'railway' ? '🚆' : p.osm_key === 'aeroway' ? '✈️' : '📍',
                isCurated: false
              };
            });

            // Prioritize cities, towns, villages, and stations over broad administrative boundaries
            remoteMatches.sort((a, b) => {
              const aCat = (a.category || '').toLowerCase();
              const bCat = (b.category || '').toLowerCase();
              const aIsAdmin = aCat.includes('administrative') || aCat.includes('county') || aCat.includes('state');
              const bIsAdmin = bCat.includes('administrative') || bCat.includes('county') || bCat.includes('state');
              if (aIsAdmin && !bIsAdmin) return 1;
              if (!aIsAdmin && bIsAdmin) return -1;
              return 0;
            });
          }
        }
      } catch (err) {
        console.warn('Photon API fetch error, trying Nominatim fallback', err);
      }

      // 3. Fallback to Nominatim if Photon returns nothing
      if (remoteMatches.length === 0 && localMatches.length === 0) {
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=4`);
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            remoteMatches = nomData.map((item, idx) => ({
              id: `nom-${idx}-${item.place_id}`,
              title: item.display_name.split(',')[0],
              subtitle: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              category: item.type || 'Point of Interest',
              icon: '📍',
              isCurated: false
            }));
          }
        } catch (e) {}
      }

      // Combine local landmarks first, followed by live map geocodes
      const combined = [...localMatches, ...remoteMatches];
      // Deduplicate by proximity
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        const key = `${item.lat.toFixed(3)},${item.lng.toFixed(3)}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }

      setSuggestions(unique.slice(0, 7));
      setShowDropdown(unique.length > 0);
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [value, isTyping]);

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.title + (suggestion.subtitle ? ` (${suggestion.subtitle.split(',')[0]})` : ''));
    setShowDropdown(false);
    setIsTyping(false);
    if (onGeocode) {
      onGeocode(suggestion.title, {
        lat: suggestion.lat,
        lng: suggestion.lng
      });
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
    setIsTyping(false);
    if (onGeocode) {
      onGeocode('', null);
    }
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <div className="flex justify-between items-center text-xs">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <FaMapMarkerAlt className="text-emerald-600" />
          <span>{label}</span>
        </label>
        {coords && (
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsTyping(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs font-medium"
          placeholder={placeholder}
          required
        />

        {/* Leading Search Icon */}
        <div className="absolute left-3 text-slate-400 pointer-events-none text-xs">
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent"></span>
          ) : (
            <FaSearch />
          )}
        </div>

        {/* Trailing Action Buttons */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Clear input"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              if (onGeocode && value) onGeocode(value);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Find
          </button>
        </div>
      </div>

      {/* Google Maps-Style Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white/98 backdrop-blur-xl border border-slate-200 mt-1 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-slate-50/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex justify-between items-center">
            <span>Google Maps / OSM Live Suggestions</span>
            <span>{suggestions.length} places found</span>
          </div>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-3.5 py-2.5 hover:bg-emerald-50/80 cursor-pointer text-xs text-slate-700 transition-colors flex items-start gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform text-xs">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 truncate group-hover:text-emerald-700 text-xs sm:text-sm">
                    {suggestion.title}
                  </span>
                  {suggestion.category && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {suggestion.category}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {suggestion.subtitle}
                </p>
                <div className="text-[9px] text-emerald-600 font-mono mt-0.5">
                  {suggestion.lat.toFixed(4)}°, {suggestion.lng.toFixed(4)}°
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
