import axios from 'axios';

// Axios instance configured for the Spring Boot backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to protected requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecoroute_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized (expired token) globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event to notify AuthContext
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Password strength & requirement checker
export const checkPasswordStrength = (password) => {
  const requirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@#$%&*!^()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  let strength = 'Weak';
  let strengthColor = 'text-red-600 bg-red-100 border-red-200';
  let scorePercent = 20;

  if (metCount >= 5) {
    strength = 'Strong';
    strengthColor = 'text-green-700 bg-green-100 border-green-200';
    scorePercent = 100;
  } else if (metCount >= 3) {
    strength = 'Medium';
    strengthColor = 'text-amber-700 bg-amber-100 border-amber-200';
    scorePercent = 60;
  }

  return { requirements, metCount, strength, strengthColor, scorePercent };
};

export const apiService = {
  // Returns false since real-time email check isn't implemented in the backend. 
  // It will be caught during registration instead.
  async checkEmailRegistered(email) {
    return false;
  },

  async register(fullName, email, password) {
    try {
      const response = await apiClient.post('/auth/register', {
        name: fullName, // Backend expects 'name'
        email,
        password,
        confirmPassword: password // Assuming it's already validated on frontend
      });
      return response.data;
    } catch (error) {
      let errorMsg = error.response?.data?.message || 'Registration failed.';
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        const fieldErrors = Object.values(error.response.data.data).join(' | ');
        if (fieldErrors) errorMsg += `: ${fieldErrors}`;
      }
      throw new Error(errorMsg);
    }
  },

  // Note: Backend doesn't support OTP, bypassing this step.
  async verifyEmail(email, otpCode) {
    return { success: true };
  },

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      return response.data; // Expected { token, userId, name, email, role, profileCompleted }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email or password.');
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data.data; // ApiResponse format: { success, message, data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user.');
    }
  },

  async getDashboard() {
    try {
      const response = await apiClient.get('/dashboard');
      // The backend returns an ApiResponse where data holds the DashboardResponse
      return response.data.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data.');
    }
  },

  async updateProfile(userId, profileData) {
    try {
      const payload = {
        name: profileData.fullName || profileData.name,
        age: profileData.age ? parseInt(profileData.age, 10) : null,
        medicalInformation: profileData.medicalCondition || 'None',
        vehicleType: profileData.vehicleType ? profileData.vehicleType.toUpperCase() : 'CAR'
      };
      // Profile is auto-created on registration, so we always use PUT
      const response = await apiClient.put('/profile', payload);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  },

  async getSavedRoutes() {
    try {
      const response = await apiClient.get('/saved-routes');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch saved routes.');
    }
  },

  async saveRoute(routeData) {
    try {
      const response = await apiClient.post('/saved-routes', routeData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save route.');
    }
  },

  async deleteSavedRoute(routeId) {
    try {
      const response = await apiClient.delete(`/saved-routes/${routeId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete saved route.');
    }
  },

  async getRoadReports() {
    try {
      const response = await apiClient.get('/road-reports/me');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch road reports.');
    }
  },

  async submitRoadReport(reportData) {
    try {
      const response = await apiClient.post('/road-reports', reportData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit road report.');
    }
  },

  async planJourney(journeyData) {
    try {
      const response = await apiClient.post('/journeys', journeyData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to plan journey.');
    }
  },

  async geocode(query) {
    try {
      const response = await apiClient.get(`/location/geocode?query=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to geocode location.');
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const response = await apiClient.get(`/location/reverse?lat=${lat}&lng=${lng}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to reverse geocode location.');
    }
  },

  async getUserJourneys() {
    try {
      const response = await apiClient.get('/journeys');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch journeys.');
    }
  },

  async getJourney(journeyId) {
    try {
      const response = await apiClient.get(`/journeys/${journeyId}/routes`);
      // Since our new GET /api/journeys/{journeyId}/routes returns the JourneyResponse directly as data.
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch journey routes.');
    }
  },

  async regenerateRoutes(journeyId) {
    try {
      const response = await apiClient.post(`/journeys/${journeyId}/routes`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate routes.');
    }
  },

  async selectRoute(journeyId, routeId) {
    try {
      const response = await apiClient.put(`/journeys/${journeyId}/selected-route`, { routeId });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to select route.');
    }
  },

  async getFacilities(lat, lon, type = 'ALL', radius = 5.0) {
    try {
      const response = await apiClient.get(`/facilities?lat=${lat}&lon=${lon}&type=${type}&radius=${radius}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch facilities.');
    }
  },

  async getWeather(lat, lon) {
    try {
      const response = await apiClient.get(`/weather?lat=${lat}&lon=${lon}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async getAirQuality(lat, lon) {
    try {
      const response = await apiClient.get(`/air-quality?lat=${lat}&lon=${lon}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async getAllRoadReports() {
    try {
      const response = await apiClient.get('/road-reports');
      return response.data.data;
    } catch (error) {
      return [];
    }
  }

};
