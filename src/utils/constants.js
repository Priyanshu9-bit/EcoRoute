// API Base URLs for Spring Boot integration
export const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/v1` : 'http://localhost:8080/api/v1';

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  PLAN_JOURNEY: '/plan-journey',
  MY_TRIPS: '/my-trips',
  SAVED_ROUTES: '/saved-routes',
};

// User Medical Options
export const MEDICAL_CONDITIONS = [
  { id: 'None', label: 'None' },
  { id: 'Respiratory Issues', label: 'Respiratory Issues' },
  { id: 'Heart Condition', label: 'Heart Condition' },
  { id: 'Other', label: 'Other' }
];

// Vehicle Types
export const VEHICLE_TYPES = [
  { id: 'Bike', label: 'Bike', icon: '🏍️' },
  { id: 'Car', label: 'Car', icon: '🚗' },
  { id: 'Bus', label: 'Bus', icon: '🚌' },
  { id: 'Truck', label: 'Truck', icon: '🚚' },
  { id: 'EV', label: 'EV', icon: '⚡' }
];

// Travel Modes
export const TRAVEL_MODES = [
  { id: 'Solo', label: 'Solo' },
  { id: 'Friends', label: 'Friends' },
  { id: 'Family', label: 'Family' }
];

// Feature List for Landing Page (8 Features)
export const APP_FEATURES = [
  {
    id: 'planning',
    title: 'Smart Route Recommendation',
    description: 'Calculates eco-optimal routes considering distance, traffic, elevation, and fuel efficiency.',
    iconName: 'FaRoute'
  },
  {
    id: 'weather',
    title: 'Weather Information',
    description: 'Real-time rainfall, temperature, visibility, and wind hazard forecasting along your path.',
    iconName: 'FaCloudSun'
  },
  {
    id: 'aqi',
    title: 'Air Quality Monitoring',
    description: 'Avoid high PM2.5 and smog zones with continuous live Air Quality Index (AQI) monitoring.',
    iconName: 'FaWind'
  },
  {
    id: 'road',
    title: 'Road Condition Reports',
    description: 'Live alerts for pothole congestion, ongoing construction, landslides, and toll updates.',
    iconName: 'FaExclamationTriangle'
  },
  {
    id: 'hospitals',
    title: 'Nearby Hospitals',
    description: 'Instant pinpoints for verified medical clinics, emergency rooms, and trauma centers.',
    iconName: 'FaHospital'
  },
  {
    id: 'hospitality',
    title: 'Hotels & Restaurants',
    description: 'Find verified dining stops, family restaurants, and overnight rest accommodations.',
    iconName: 'FaUtensils'
  },
  {
    id: 'fuel',
    title: 'Fuel Stations & Garages',
    description: 'Locate nearby petrol stations, EV charging hubs, and emergency auto repair garages.',
    iconName: 'FaGasPump'
  },
  {
    id: 'emergency',
    title: 'Emergency SOS Support',
    description: 'One-click SOS distress dispatch to local authorities and pre-saved emergency contacts.',
    iconName: 'FaAmbulance'
  }
];

// 7-Step Workflow for "How EcoRoute Works"
export const ECOROUTE_STEPS = [
  {
    step: 1,
    title: 'Register your account',
    description: 'Create your account with your name, email, and password.'
  },
  {
    step: 2,
    title: 'Verify your email and log in',
    description: 'Enter your OTP code to verify your account and sign in.'
  },
  {
    step: 3,
    title: 'Complete your profile (only once)',
    description: 'Set your vehicle type, travel mode, and health preferences.'
  },
  {
    step: 4,
    title: 'Plan your journey',
    description: 'Enter your departure source location and destination.'
  },
  {
    step: 5,
    title: 'Choose preferences & facilities',
    description: 'Select route priorities and required roadside amenities.'
  },
  {
    step: 6,
    title: 'Compare all available routes',
    description: 'Review route scores, AQI index, weather, and distance.'
  },
  {
    step: 7,
    title: 'Start your journey',
    description: 'Select the recommended eco-route and begin live navigation.'
  }
];

// Why Choose EcoRoute? (6 Benefit Cards)
export const ECOROUTE_BENEFITS = [
  {
    id: 'personalized',
    title: 'Personalized Route Recommendations',
    description: 'Tailored algorithms based on your vehicle specs, health sensitivities, and companions.',
    iconName: 'FaUserCheck'
  },
  {
    id: 'decisions',
    title: 'Better Travel Decisions',
    description: 'Comparative analytics for AQI, weather hazards, and traffic metrics before you embark.',
    iconName: 'FaChartLine'
  },
  {
    id: 'awareness',
    title: 'Environmental Awareness',
    description: 'Track carbon emissions saved and choose low-emissions green transit corridors.',
    iconName: 'FaLeaf'
  },
  {
    id: 'emergency',
    title: 'Emergency Assistance',
    description: 'Instant 1-click SOS alert system with real-time location sharing.',
    iconName: 'FaShieldAlt'
  },
  {
    id: 'facilities',
    title: 'Nearby Essential Facilities',
    description: 'Live radar pinpoints for hospitals, hotels, dining, fuel, and EV charging stations.',
    iconName: 'FaMapMarkedAlt'
  },
  {
    id: 'safety',
    title: 'Safe & Comfortable Travel',
    description: 'Avoid pothole-heavy zones, heavy smog pockets, and flood-prone expressways.',
    iconName: 'FaCheckCircle'
  }
];

// Quick Statistics
export const QUICK_STATS = [
  { label: 'Routes Planned', value: '10,000+' },
  { label: 'Registered Users', value: '5,000+' },
  { label: 'Successful Trips', value: '15,000+' },
  { label: 'User Satisfaction', value: '99%' }
];

// Travel Tips for Dashboard
export const TRAVEL_TIPS = [
  { id: 1, text: 'Check the real-time AQI & weather forecasts before embarking on long trips.' },
  { id: 2, text: 'Keep emergency medical contacts and hospital locations updated in your profile.' },
  { id: 3, text: 'Choose the safest, low-emissions route when traveling with elderly or family members.' },
  { id: 4, text: 'Carry sufficient fuel or plan EV charging stops using our nearby facility radar.' },
  { id: 5, text: 'Report road hazards to assist fellow travelers in the EcoRoute community.' }
];
