import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import FeatureCard from '../components/FeatureCard';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import {
  APP_FEATURES,
  ECOROUTE_STEPS,
  ECOROUTE_BENEFITS,
  QUICK_STATS,
  ROUTES
} from '../utils/constants';
import {
  FaLeaf,
  FaSignInAlt,
  FaUserPlus,
  FaCompass,
  FaUserCheck,
  FaChartLine,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaRocket,
  FaWind,
  FaCloudSun,
  FaTree,
  FaBolt,
  FaCarSide,
  FaBicycle,
  FaArrowRight,
  FaHospital,
  FaUtensils,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Interactive Route Simulator state
  const [selectedRouteType, setSelectedRouteType] = useState('eco'); // 'eco' | 'highway' | 'scenic'
  const [calcDistance, setCalcDistance] = useState(45); // in km
  const [calcVehicle, setCalcVehicle] = useState('car'); // 'car' | 'ev' | 'bike'

  const handlePlanJourneyClick = () => {
    if (isAuthenticated) {
      navigate(ROUTES.PLAN_JOURNEY);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const benefitIcons = {
    personalized: FaUserCheck,
    decisions: FaChartLine,
    awareness: FaLeaf,
    emergency: FaShieldAlt,
    facilities: FaMapMarkedAlt,
    safety: FaCheckCircle
  };

  // Route preview details based on selectedRouteType
  const routeScenarios = {
    eco: {
      name: 'Eco-Optimized Route (Recommended)',
      tag: 'Lowest Emissions',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      aqi: 28,
      aqiLabel: 'Good (Pure Air)',
      aqiColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      co2Saved: '38%',
      duration: '48 mins',
      distance: '34.2 km',
      weather: '24°C • Clean Sky',
      facilities: '4 Ev Charging • 2 Medical • 5 Rest Stops',
      pathColor: '#059669',
      strokeWidth: 6,
      strokeDash: 'animate-dash',
      pathD: 'M 50 280 C 130 180, 190 230, 270 120 C 340 40, 390 120, 450 80'
    },
    highway: {
      name: 'Fastest Highway Route',
      tag: 'High Traffic Congestion',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
      aqi: 86,
      aqiLabel: 'Moderate (Smog Risk)',
      aqiColor: 'text-amber-600 bg-amber-50 border-amber-200',
      co2Saved: '0%',
      duration: '44 mins',
      distance: '38.5 km',
      weather: '27°C • Heavy Haze',
      facilities: '2 Gas Stations • 1 Hospital',
      pathColor: '#f59e0b',
      strokeWidth: 5,
      strokeDash: '',
      pathD: 'M 50 280 C 150 280, 200 170, 290 180 C 370 190, 400 90, 450 80'
    },
    scenic: {
      name: 'Scenic Green Corridor',
      tag: 'Nature & Parks',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-300',
      aqi: 22,
      aqiLabel: 'Excellent (Clean Zone)',
      aqiColor: 'text-teal-600 bg-teal-50 border-teal-200',
      co2Saved: '26%',
      duration: '52 mins',
      distance: '36.8 km',
      weather: '23°C • Gentle Breeze',
      facilities: '6 Parks • 3 Rest Stops • 2 Cafes',
      pathColor: '#0d9488',
      strokeWidth: 5,
      strokeDash: '',
      pathD: 'M 50 280 C 100 240, 160 300, 240 240 C 320 180, 370 20, 450 80'
    }
  };

  const activeRoute = routeScenarios[selectedRouteType];

  // Eco impact calculator computations
  const getSavings = () => {
    let factor = 0.15; // kg CO2 per km for average petrol car
    if (calcVehicle === 'ev') factor = 0.04;
    if (calcVehicle === 'bike') factor = 0.0;
    const baseEmissions = (calcDistance * 0.192).toFixed(1);
    const ecoEmissions = (calcDistance * factor).toFixed(1);
    const saved = Math.max(0, (baseEmissions - ecoEmissions)).toFixed(1);
    const treesEquiv = ((saved * 10) / 21).toFixed(1);
    return { baseEmissions, ecoEmissions, saved, treesEquiv };
  };

  const impact = getSavings();

  return (
    <MainLayout>
      <div className="space-y-12 sm:space-y-16 lg:space-y-20 py-2 sm:py-4">
        
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 p-5 sm:p-8 lg:p-10 shadow-xl shadow-emerald-500/5 bg-mesh-radial">
          {/* Ambient luminous glow balls */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-float" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none animate-float-delayed" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            
            {/* Left Column Content */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide">AI-Powered Environmental Routing Engine</span>
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Navigate Clean. <br />
                  <span className="text-gradient-emerald">Breathe Fresh.</span>
                </h1>
                <p className="text-base sm:text-lg font-bold text-slate-700 leading-snug">
                  Smart Environmental Route Recommendation System
                </p>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                EcoRoute dynamically recalculates the healthiest, lowest-emission and safest routes by evaluating real-time air quality (AQI), weather forecasts, road hazards, and vital medical/charging facilities along your path.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  icon={FaRocket}
                  onClick={() => navigate(isAuthenticated ? ROUTES.PLAN_JOURNEY : ROUTES.REGISTER)}
                  className="shadow-lg shadow-emerald-600/30 text-sm font-bold"
                >
                  {isAuthenticated ? 'Plan Your Route Now' : 'Get Started Free'}
                </Button>

                {isAuthenticated ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={FaChartLine}
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={FaSignInAlt}
                      onClick={() => navigate(ROUTES.LOGIN)}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const target = document.getElementById('how-it-works');
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      See How It Works
                    </Button>
                  </>
                )}
              </div>

              {/* Highlights Pill Strip */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-slate-600 text-xs font-bold">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <FaWind className="text-emerald-500 text-sm shrink-0" />
                  <span className="truncate">Live Air Quality</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <FaCloudSun className="text-amber-500 text-sm shrink-0" />
                  <span className="truncate">Live Radar</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <FaShieldAlt className="text-teal-500 text-sm shrink-0" />
                  <span className="truncate">SOS Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Environmental Route Radar */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl shadow-emerald-900/10 space-y-5">
                
                {/* Visualizer Header with Interactive Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <FaLeaf /> Live Environmental Route Radar
                    </span>
                    <h3 className="text-base font-black text-slate-800">
                      Route Comparison Simulator
                    </h3>
                  </div>

                  {/* Route Selector Tabs */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 text-xs font-bold">
                    <button
                      onClick={() => setSelectedRouteType('eco')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedRouteType === 'eco'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🌿 Eco
                    </button>
                    <button
                      onClick={() => setSelectedRouteType('highway')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedRouteType === 'highway'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ⚡ Fast
                    </button>
                    <button
                      onClick={() => setSelectedRouteType('scenic')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedRouteType === 'scenic'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏞️ Scenic
                    </button>
                  </div>
                </div>

                {/* Simulated Map Canvas */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-2 border border-slate-800">
                  <svg viewBox="0 0 500 320" className="w-full h-auto drop-shadow-lg">
                    <defs>
                      <pattern id="radarGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                      </pattern>
                      <linearGradient id="ecoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid */}
                    <rect width="100%" height="100%" fill="#090d16" rx="12" />
                    <rect width="100%" height="100%" fill="url(#radarGrid)" rx="12" />

                    {/* Clean Air Zones (Ambient Ellipses) */}
                    <ellipse cx="140" cy="180" rx="70" ry="50" fill="#059669" opacity="0.12" />
                    <ellipse cx="360" cy="90" rx="80" ry="60" fill="#0d9488" opacity="0.12" />

                    {/* Static Inactive Routes in Background */}
                    {selectedRouteType !== 'highway' && (
                      <path d="M 50 280 C 150 280, 200 170, 290 180 C 370 190, 400 90, 450 80" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="4,4" />
                    )}
                    {selectedRouteType !== 'eco' && (
                      <path d="M 50 280 C 130 180, 190 230, 270 120 C 340 40, 390 120, 450 80" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="4,4" />
                    )}
                    {selectedRouteType !== 'scenic' && (
                      <path d="M 50 280 C 100 240, 160 300, 240 240 C 320 180, 370 20, 450 80" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="4,4" />
                    )}

                    {/* Active Selected Route */}
                    <path
                      d={activeRoute.pathD}
                      fill="none"
                      stroke={activeRoute.pathColor}
                      strokeWidth={activeRoute.strokeWidth}
                      className={activeRoute.strokeDash}
                    />

                    {/* Origin & Destination Nodes */}
                    <g transform="translate(50, 280)">
                      <circle r="14" fill="#10b981" opacity="0.3" className="animate-pulse" />
                      <circle r="9" fill="#10b981" />
                      <circle r="4" fill="#ffffff" />
                      <text x="0" y="-18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Origin</text>
                    </g>

                    <g transform="translate(450, 80)">
                      <circle r="14" fill="#06b6d4" opacity="0.3" className="animate-pulse" />
                      <circle r="9" fill="#06b6d4" />
                      <circle r="4" fill="#ffffff" />
                      <text x="0" y="-18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Destination</text>
                    </g>

                    {/* Sensor / Facility Radars */}
                    <g transform="translate(190, 210)">
                      <circle r="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="11">🌲</text>
                    </g>
                    <g transform="translate(300, 140)">
                      <circle r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="11">⚡</text>
                    </g>
                    <g transform="translate(380, 70)">
                      <circle r="12" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="11">🏥</text>
                    </g>

                    {/* Floating HUD telemetry card */}
                    <g transform="translate(160, 45)">
                      <rect x="0" y="0" width="180" height="42" rx="8" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="12" y="18" fill="#38bdf8" fontSize="9" fontWeight="bold" letterSpacing="0.5">LIVE SENSOR TELEMETRY</text>
                      <text x="12" y="32" fill="#f8fafc" fontSize="11" fontWeight="bold">
                        AQI: {activeRoute.aqi} • {activeRoute.co2Saved} CO₂ Saved
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Route Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Air Quality</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{activeRoute.aqi} AQI</p>
                    <span className="text-[10px] font-semibold text-emerald-600">{activeRoute.aqiLabel}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Est. Duration</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{activeRoute.duration}</p>
                    <span className="text-[10px] font-semibold text-slate-500">{activeRoute.distance}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">CO₂ Reduction</p>
                    <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{activeRoute.co2Saved}</p>
                    <span className="text-[10px] font-semibold text-slate-500">vs Normal Route</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Weather Ahead</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">{activeRoute.weather}</p>
                    <span className="text-[10px] font-semibold text-slate-500">Live Forecast</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 2. INTERACTIVE ECO IMPACT ESTIMATOR */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/30">
                Interactive Simulator
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Calculate Your Eco Savings
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Estimate the direct environmental impact of routing through EcoRoute clean-air corridors.
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-800/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700/60">
              
              <div className="space-y-6">
                {/* Vehicle Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                    Select Vehicle Type
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setCalcVehicle('car')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        calcVehicle === 'car'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <FaCarSide className="text-lg" />
                      <span className="text-xs font-bold">Standard Car</span>
                    </button>
                    <button
                      onClick={() => setCalcVehicle('ev')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        calcVehicle === 'ev'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <FaBolt className="text-lg" />
                      <span className="text-xs font-bold">EV / Hybrid</span>
                    </button>
                    <button
                      onClick={() => setCalcVehicle('bike')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        calcVehicle === 'bike'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <FaBicycle className="text-lg" />
                      <span className="text-xs font-bold">Bike / EV 2W</span>
                    </button>
                  </div>
                </div>

                {/* Distance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Estimated Trip Distance
                    </label>
                    <span className="text-sm font-black text-emerald-400">{calcDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5 km (Local)</span>
                    <span>100 km (Intercity)</span>
                    <span>200 km (Highway)</span>
                  </div>
                </div>
              </div>

              {/* Output Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/30 text-center">
                  <p className="text-[11px] font-bold uppercase text-slate-400">CO₂ Avoided</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{impact.saved} <span className="text-sm font-medium text-slate-300">kg</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Direct tailpipe reduction</p>
                </div>

                <div className="bg-slate-900/80 p-5 rounded-xl border border-teal-500/30 text-center">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Tree Equivalence</p>
                  <p className="text-3xl font-black text-teal-400 mt-1">{impact.treesEquiv} <span className="text-sm font-medium text-slate-300">trees</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Day absorption equivalent</p>
                </div>

                <div className="col-span-2 bg-emerald-950/60 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-lg">
                      <FaLeaf />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Start Planning with EcoRoute</p>
                      <p className="text-[11px] text-slate-400">Apply clean parameters directly to your journeys</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePlanJourneyClick}
                    icon={FaArrowRight}
                  >
                    Go
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. CORE FEATURES */}
        <section id="features-section" className="space-y-10 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Intelligent Environmental Navigation
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every route calculation is scored across multiple live sensor data points for health, efficiency, and roadside safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {APP_FEATURES.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                iconName={feature.iconName}
              />
            ))}
          </div>
        </section>

        {/* 4. HOW ECOROUTE WORKS - MODERN STEPPER */}
        <section id="how-it-works" className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-12 space-y-10 scroll-mt-24 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Workflow Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How EcoRoute Operates
            </h2>
            <p className="text-slate-600 text-sm">
              From origin selection to turn-by-turn live navigation in 7 structured steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ECOROUTE_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      0{item.step}
                    </span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WHY CHOOSE ECOROUTE */}
        <section id="why-choose-us" className="space-y-10 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Key Value Proposition
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Travelers Choose EcoRoute
            </h2>
            <p className="text-slate-600 text-sm">
              A comprehensive safety and clean mobility ecosystem tailored for daily commutes and long journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ECOROUTE_BENEFITS.map((benefit) => {
              const IconComp = benefitIcons[benefit.id] || FaCheckCircle;
              return (
                <Card key={benefit.id} className="p-6 space-y-3.5 bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200/60 shadow-xs">
                    <IconComp />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 6. QUICK STATISTICS */}
        <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-mesh-radial pointer-events-none" />
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-200 bg-white/10 px-3.5 py-1 rounded-full backdrop-blur-xs">
              System Benchmarks
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Impact & Performance</h2>
            <p className="text-xs sm:text-sm text-emerald-100">Live operational telemetry across our recommendation algorithms.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {QUICK_STATS.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/15 hover:bg-white/15 transition-all">
                <p className="text-3xl sm:text-4xl font-black text-white mb-1.5">{stat.value}</p>
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. CALL-TO-ACTION */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-xl mb-4 shadow-xs">
              <FaCompass />
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Ready to Plan Your First Eco Journey?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Experience the power of intelligent routing. Enter your departure and arrival points to discover cleaner, safer, and optimized pathways.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 relative z-10">
            <Button
              variant="primary"
              size="lg"
              icon={FaCompass}
              onClick={handlePlanJourneyClick}
              className="text-base px-8 py-4 shadow-lg shadow-emerald-600/30"
            >
              Plan Your Journey
            </Button>

            {!isAuthenticated && (
              <Button
                variant="secondary"
                size="lg"
                icon={FaUserPlus}
                onClick={() => navigate(ROUTES.REGISTER)}
                className="text-base px-6 py-4"
              >
                Create Free Account
              </Button>
            )}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
