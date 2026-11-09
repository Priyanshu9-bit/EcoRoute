import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Protected Pages
import { DashboardPage } from './pages/DashboardPage';
import { PlanJourneyPage } from './pages/PlanJourneyPage';
import { RouteResultsPage } from './pages/RouteResultsPage';
import { NavigationPage } from './pages/NavigationPage';
import { RoadReportsPage } from './pages/RoadReportsPage';
import { EmergencyPage } from './pages/EmergencyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/plan-journey" element={<PlanJourneyPage />} />
              <Route path="/route-results" element={<RouteResultsPage />} />
              <Route path="/navigation" element={<NavigationPage />} />
              <Route path="/road-reports" element={<RoadReportsPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
            </Route>

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}