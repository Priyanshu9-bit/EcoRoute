import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { AuthContext } from './AuthContextObject';

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ecoroute_token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          const formattedUser = {
            id: userData.id,
            fullName: userData.name,
            email: userData.email,
            isProfileComplete: userData.profileCompleted
          };
          setUser(formattedUser);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Session expired or invalid token', err);
          logout();
        }
      }
      setIsInitializing(false);
    };
    initAuth();

    const handleAuthExpired = () => {
      logout();
      window.location.href = '/login?expired=true';
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await apiService.login(email, password);
      localStorage.setItem('ecoroute_token', res.token);
      
      // Res contains token, userId, name, email, role, profileCompleted
      // Convert it to standard user object for frontend
      const userData = {
        id: res.userId,
        fullName: res.name,
        email: res.email,
        isProfileComplete: res.profileCompleted
      };
      
      localStorage.setItem('ecoroute_current_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await apiService.register(fullName, email, password);
      return res;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otpCode) => {
    // Bypassed for real backend
    return { success: true };
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const userId = user?.id;
      await apiService.updateProfile(userId, profileData);
      
      const updatedUser = { ...user, isProfileComplete: true };
      setUser(updatedUser);
      localStorage.setItem('ecoroute_current_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ecoroute_token');
    localStorage.removeItem('ecoroute_current_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        authError,
        login,
        register,
        verifyEmail,
        updateProfile,
        logout,
        setAuthError
      }}
    >
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};
