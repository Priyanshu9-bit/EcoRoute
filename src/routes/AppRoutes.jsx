import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import DashboardPage from '../pages/DashboardPage';
import PlanJourneyPage from '../pages/PlanJourneyPage';
import RouteResultsPage from '../pages/RouteResultsPage';
import LiveJourneyPage from '../pages/LiveJourneyPage';
import NavigationPage from '../pages/NavigationPage';
import MyTripsPage from '../pages/MyTripsPage';
import SavedRoutesPage from '../pages/SavedRoutesPage';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home / Landing Page: Accessible to all users */}
      <Route path="/" element={<HomePage />} />
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/landing" element={<HomePage />} />

      {/* Public Auth Pages */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Profile Page (Step 1 of Onboarding & editing) */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Main Authenticated Dashboard */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute requireCompleteProfile>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Plan Journey Page (Step 2 of Onboarding & route query) */}
      <Route
        path={ROUTES.PLAN_JOURNEY}
        element={
          <ProtectedRoute requireCompleteProfile>
            <PlanJourneyPage />
          </ProtectedRoute>
        }
      />

      {/* Route Results Page */}
      <Route
        path="/route-results/:journeyId"
        element={
          <ProtectedRoute requireCompleteProfile>
            <RouteResultsPage />
          </ProtectedRoute>
        }
      />

      {/* Live Journey Navigation Session */}
      <Route
        path="/live-journey"
        element={
          <ProtectedRoute requireCompleteProfile>
            <LiveJourneyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navigation/:routeId"
        element={
          <ProtectedRoute requireCompleteProfile>
            <NavigationPage />
          </ProtectedRoute>
        }
      />

      {/* Trip History Log */}
      <Route
        path={ROUTES.MY_TRIPS}
        element={
          <ProtectedRoute requireCompleteProfile>
            <MyTripsPage />
          </ProtectedRoute>
        }
      />

      {/* Saved Routes */}
      <Route
        path={ROUTES.SAVED_ROUTES}
        element={
          <ProtectedRoute requireCompleteProfile>
            <SavedRoutesPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
