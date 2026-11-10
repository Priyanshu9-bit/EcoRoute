import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export default function ProtectedRoute({ children, requireCompleteProfile = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. If not logged in -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. If logged in but profile is incomplete (first login) and attempting to visit pages that require complete profile
  if (requireCompleteProfile && user && !user.isProfileComplete) {
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  return children;
}
