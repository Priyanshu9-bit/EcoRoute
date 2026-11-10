import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import { apiService } from '../services/api';
import { ROUTES } from '../utils/constants';
import {
  FaCompass, FaHistory, FaBookmark, FaUserCog, 
  FaAmbulance, FaExclamationTriangle, FaMapMarkerAlt, 
  FaCar, FaUser, FaLeaf
} from 'react-icons/fa';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiService.getDashboard();
        setData(result);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-500 font-semibold text-lg animate-pulse">Loading your dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto" />
            <p className="text-slate-700 font-semibold">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { user, profile, recentTrips, savedRoutes, preferences } = data || {};

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 py-3 sm:py-5 px-3 sm:px-6">
        
        {/* 1. Welcome Section */}
        <section className="pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-gradient-emerald">{user?.name || 'Traveler'}</span> 👋
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Plan, monitor, and optimize your environmental journeys with EcoRoute.
            </p>
          </div>
        </section>

        {/* 2. Plan Your Journey - MAIN FEATURE */}
        <section>
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg shadow-emerald-900/15 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden border border-emerald-600/30">
            <div className="space-y-3 relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Plan Your Journey</h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                Find and compare routes based on distance, travel time, real-time AQI, weather hazards, and essential roadside facilities.
              </p>
            </div>
            <div className="relative z-10 shrink-0 mt-2 md:mt-0">
              <Button
                variant="secondary"
                size="md"
                icon={FaCompass}
                onClick={() => navigate(ROUTES.PLAN_JOURNEY)}
                className="bg-white text-emerald-900 hover:bg-emerald-50 hover:scale-105 transition-all shadow-xl border-0 px-6 py-3 text-sm font-black cursor-pointer"
              >
                Start Planning
              </Button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>

        {/* 3. Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Quick Navigation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card onClick={() => navigate(ROUTES.PLAN_JOURNEY)} className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:shadow-lg cursor-pointer transition-all gap-2 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shadow-2xs">
                <FaCompass />
              </div>
              <span className="text-xs font-bold text-slate-800">Plan Journey</span>
            </Card>
            <Card onClick={() => navigate(ROUTES.MY_TRIPS)} className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:shadow-lg cursor-pointer transition-all gap-2 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg shadow-2xs">
                <FaHistory />
              </div>
              <span className="text-xs font-bold text-slate-800">Trip History</span>
            </Card>
            <Card onClick={() => navigate(ROUTES.SAVED_ROUTES)} className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:shadow-lg cursor-pointer transition-all gap-2 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg shadow-2xs">
                <FaBookmark />
              </div>
              <span className="text-xs font-bold text-slate-800">Saved Routes</span>
            </Card>
            <Card onClick={() => navigate(ROUTES.PROFILE)} className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:shadow-lg cursor-pointer transition-all gap-2 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg shadow-2xs">
                <FaUserCog />
              </div>
              <span className="text-xs font-bold text-slate-800">Profile</span>
            </Card>

            <Card onClick={() => navigate('/road-reports')} className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center hover:border-amber-400 hover:shadow-lg cursor-pointer transition-all gap-2 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg shadow-2xs">
                <FaExclamationTriangle />
              </div>
              <span className="text-xs font-bold text-slate-800">Road Reports</span>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Main Column (Recent Trips & Saved Routes) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Trips */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-2">Recent Trips</h3>
              {(!recentTrips || recentTrips.length === 0) ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3">
                  <p className="text-slate-500 font-medium">You haven't completed any trips yet.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PLAN_JOURNEY)}>Plan Your First Journey</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map(trip => (
                    <Card key={trip.id} className="p-5 flex items-center justify-between hover:border-green-300 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {trip.source} <span className="text-slate-400">→</span> {trip.destination}
                        </h4>
                        <div className="flex gap-4 text-xs text-slate-500 font-medium">
                          <span>{trip.distance || 'N/A'}</span>
                          <span>{trip.duration || 'N/A'}</span>
                          <span>{new Date(trip.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.MY_TRIPS)}>View</Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Saved Routes */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-2">Saved Routes</h3>
              {(!savedRoutes || savedRoutes.length === 0) ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3">
                  <p className="text-slate-500 font-medium">No saved routes yet.<br/>Plan a journey and save your frequently used routes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedRoutes.map(route => (
                    <Card key={route.id} className="p-5 flex flex-col justify-between hover:border-green-400 cursor-pointer transition-all group" onClick={() => navigate(ROUTES.PLAN_JOURNEY)}>
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-green-700">
                          🏠 {route.source} <span className="text-slate-400">→</span> {route.destination}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1"><FaCar/> {route.vehicleType || 'Car'}</span>
                          <span className="font-medium bg-slate-100 px-2 py-1 rounded">{route.distance || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Sidebar (Profile, Preferences, Emergency, Informational) */}
          <div className="space-y-6">
            
            {/* User Profile Summary */}
            <Card className="p-6 space-y-4 border-t-4 border-t-green-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-lg">
                  <FaUser />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user?.name}</h3>
                  <p className="text-xs text-slate-500">EcoRoute Traveler</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Age:</span>
                  <span className="font-semibold text-slate-800">{profile?.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-semibold text-slate-800 capitalize">{profile?.vehicleType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medical Info:</span>
                  <span className="font-semibold text-slate-800">
                    {profile?.medicalInformation ? 'Added' : 'Not Added'}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(ROUTES.PROFILE)}>
                View Profile
              </Button>
            </Card>

            {/* Travel Preferences */}
            <Card className="p-6 space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Your Travel Preferences</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-semibold capitalize">🚗 {preferences?.vehicle || 'Car'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-500">Preferred Route:</span>
                  <span className="font-semibold text-green-700">🛡️ {preferences?.preferredRoute || 'Safest'}</span>
                </p>
              </div>
              <div className="pt-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(ROUTES.PROFILE)}>
                  Edit Preferences
                </Button>
              </div>
            </Card>

            {/* Emergency Assistance */}
            <Card className="p-6 space-y-4 bg-red-50 border-red-200">
              <h4 className="font-bold text-red-700 flex items-center gap-2">
                <FaAmbulance /> Emergency Assistance
              </h4>
              <p className="text-xs text-red-600 leading-relaxed font-medium">
                Need help during your journey?
              </p>
              <Button variant="primary" size="sm" fullWidth className="bg-red-600 hover:bg-red-700 border-red-600" onClick={() => navigate('/emergency')}>
                Find Nearby Help
              </Button>
            </Card>
            
            {/* Road Reports */}
            <Card className="p-6 space-y-4 bg-amber-50 border-amber-200">
              <h4 className="font-bold text-amber-700 flex items-center gap-2">
                <FaExclamationTriangle /> Road Reports
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Report road problems such as construction, potholes, accidents, or waterlogging.
              </p>
              <Button variant="primary" size="sm" fullWidth className="bg-amber-600 hover:bg-amber-700 border-amber-600" onClick={() => navigate('/road-reports')}>
                View Road Reports
              </Button>
            </Card>

            {/* Environmental Overview */}
            <Card className="p-6 space-y-3 border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <FaLeaf className="text-green-600" /> EcoRoute Intelligence
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                EcoRoute analyzes your journey using:
              </p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-slate-700 font-medium">
                <span className="flex items-center gap-1">🌦 Weather</span>
                <span className="flex items-center gap-1">🌿 Air Quality</span>
                <span className="flex items-center gap-1">🚧 Road Cond.</span>
                <span className="flex items-center gap-1">🏗️ Construction</span>
                <span className="flex items-center gap-1">🏥 Hospitals</span>
                <span className="flex items-center gap-1">🏨 Hotels</span>
                <span className="flex items-center gap-1">🍴 Restaurants</span>
                <span className="flex items-center gap-1">🔧 Garages</span>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
