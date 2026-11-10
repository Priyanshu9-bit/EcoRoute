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
    try {
      const users = JSON.parse(localStorage.getItem('ecoroute_local_users') || '[]');
      return users.some(u => u.email?.toLowerCase() === email?.toLowerCase());
    } catch {
      return false;
    }
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
      // If the backend actively returned an error response (e.g. 400 Bad Request, duplicate email)
      if (error.response) {
        let errorMsg = error.response.data?.message || 'Registration failed.';
        if (error.response.data?.data && typeof error.response.data.data === 'object') {
          const fieldErrors = Object.values(error.response.data.data).join(' | ');
          if (fieldErrors) errorMsg += `: ${fieldErrors}`;
        }
        throw new Error(errorMsg);
      }

      // Backend unreachable (e.g., deployed on Vercel without cloud backend, or backend offline)
      console.warn('Backend server unreachable. Enabling local demo account fallback.', error);
      const mockUser = {
        id: Date.now(),
        name: fullName,
        email: email,
        role: 'ROLE_USER',
        accountStatus: 'ACTIVE',
        profileCompleted: false,
        isOfflineDemo: true
      };
      const users = JSON.parse(localStorage.getItem('ecoroute_local_users') || '[]');
      if (users.some(u => u.email?.toLowerCase() === email?.toLowerCase())) {
        throw new Error('Registration Failed. Email is already registered. Please login instead.');
      }
      users.push({ ...mockUser, password });
      localStorage.setItem('ecoroute_local_users', JSON.stringify(users));
      localStorage.setItem('ecoroute_current_user', JSON.stringify(mockUser));
      return { success: true, message: 'User registered successfully (Demo Mode)', data: mockUser };
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
      if (error.response) {
        throw new Error(error.response.data?.message || 'Invalid email or password.');
      }

      // Backend unreachable: check local demo store or built-in test account
      console.warn('Backend server unreachable. Attempting demo login fallback.', error);
      const users = JSON.parse(localStorage.getItem('ecoroute_local_users') || '[]');
      const matched = users.find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.password === password);
      if (matched || (email === 'demo@ecoroute.com' && password === 'Password@123')) {
        const userObj = matched || {
          id: 1,
          name: 'Demo Eco Traveler',
          email: 'demo@ecoroute.com',
          role: 'ROLE_USER',
          profileCompleted: true
        };
        const demoToken = 'demo_jwt_' + btoa(JSON.stringify(userObj));
        localStorage.setItem('ecoroute_token', demoToken);
        localStorage.setItem('ecoroute_current_user', JSON.stringify(userObj));
        return {
          token: demoToken,
          userId: userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          profileCompleted: userObj.profileCompleted ?? true
        };
      }
      throw new Error('Backend server is unreachable and credentials not found in local demo accounts. Tip: You can register a new account or sign in with demo@ecoroute.com / Password@123.');
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data.data; // ApiResponse format: { success, message, data }
    } catch (error) {
      const cached = localStorage.getItem('ecoroute_current_user');
      if (cached) {
        return JSON.parse(cached);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user.');
    }
  },

  async getDashboard() {
    try {
      const response = await apiClient.get('/dashboard');
      // The backend returns an ApiResponse where data holds the DashboardResponse
      return response.data.data; 
    } catch (error) {
      // Demo metrics fallback
      return {
        totalJourneys: 8,
        totalDistance: 246.5,
        totalCo2Saved: 42.8,
        treesEquivalent: 2.1,
        averageAqi: 36,
        recentJourneys: [
          {
            id: 101,
            sourceName: 'Central Eco Park',
            destName: 'Green Tech Corridor',
            distance: 28.4,
            duration: '38 mins',
            co2Saved: '5.2 kg',
            aqi: 32,
            createdAt: new Date().toISOString()
          }
        ]
      };
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
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update profile.');
      }
      const cached = JSON.parse(localStorage.getItem('ecoroute_current_user') || '{}');
      const updated = { ...cached, ...profileData, profileCompleted: true };
      localStorage.setItem('ecoroute_current_user', JSON.stringify(updated));
      return updated;
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
      if (error.response) {
        throw new Error(error.response?.data?.message || 'Failed to plan journey.');
      }
      // Demo journey fallback for online Vercel preview when backend isn't deployed
      console.warn('Backend server unreachable. Generating demo journey routes.', error);
      const sLat = journeyData.sourceLat || 28.6139;
      const sLng = journeyData.sourceLon || 77.2090;
      const dLat = journeyData.destLat || 28.5355;
      const dLng = journeyData.destLon || 77.3910;

      const mockId = Date.now();
      const mockJourney = {
        id: mockId,
        sourceName: journeyData.sourceName || 'Departure',
        destinationName: journeyData.destinationName || 'Destination',
        sourceLatitude: sLat,
        sourceLongitude: sLng,
        destinationLatitude: dLat,
        destinationLongitude: dLng,
        routes: [
          {
            id: 1,
            routeName: 'Eco-Friendly Low-Emission Corridor',
            distance: 31.8,
            duration: 42,
            carbonEmission: 4.1,
            airQualityScore: 32,
            safetyScore: 94,
            isRecommended: true,
            routeGeometry: `[[${sLat},${sLng}],[${(sLat+dLat)/2 + 0.01},${(sLng+dLng)/2 - 0.01}],[${dLat},${dLng}]]`,
            weather: { temperature: 24, condition: 'Clear Sky', aqi: 32, aqiCategory: 'Good' }
          },
          {
            id: 2,
            routeName: 'Fastest Direct Expressway',
            distance: 29.5,
            duration: 35,
            carbonEmission: 6.8,
            airQualityScore: 78,
            safetyScore: 88,
            isRecommended: false,
            routeGeometry: `[[${sLat},${sLng}],[${(sLat+dLat)/2},${(sLng+dLng)/2}],[${dLat},${dLng}]]`,
            weather: { temperature: 26, condition: 'Hazy', aqi: 78, aqiCategory: 'Moderate' }
          },
          {
            id: 3,
            routeName: 'Scenic Green Corridor',
            distance: 34.2,
            duration: 48,
            carbonEmission: 4.8,
            airQualityScore: 28,
            safetyScore: 92,
            isRecommended: false,
            routeGeometry: `[[${sLat},${sLng}],[${(sLat+dLat)/2 - 0.015},${(sLng+dLng)/2 + 0.015}],[${dLat},${dLng}]]`,
            weather: { temperature: 23, condition: 'Pleasant', aqi: 28, aqiCategory: 'Good' }
          }
        ]
      };
      sessionStorage.setItem('ecoroute_journey_' + mockId, JSON.stringify(mockJourney));
      return mockJourney;
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
      return [];
    }
  },

  async getJourney(journeyId) {
    try {
      const response = await apiClient.get(`/journeys/${journeyId}/routes`);
      // Since our new GET /api/journeys/{journeyId}/routes returns the JourneyResponse directly as data.
      return response.data.data;
    } catch (error) {
      const cached = sessionStorage.getItem('ecoroute_journey_' + journeyId);
      if (cached) {
        return JSON.parse(cached);
      }
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
      if (error.response) {
        throw new Error(error.response?.data?.message || 'Failed to select route.');
      }
      return { success: true, journeyId, selectedRouteId: routeId };
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
