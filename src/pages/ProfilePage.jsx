import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Card from '../components/Card';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { MEDICAL_CONDITIONS, VEHICLE_TYPES, TRAVEL_MODES, ROUTES } from '../utils/constants';
import {
  FaUserEdit,
  FaHeartbeat,
  FaCar,
  FaUsers,
  FaSave,
  FaForward,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age ? String(user.age) : '',
    medicalCondition: user?.medicalCondition || 'None',
    vehicleType: user?.vehicleType || 'EV',
    travelMode: user?.travelMode || 'Solo'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  // Sync profile data on mount and whenever user changes or existing profile is fetched
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        age: user.age ? String(user.age) : prev.age,
        medicalCondition: user.medicalCondition || prev.medicalCondition || 'None',
        vehicleType: user.vehicleType || prev.vehicleType || 'EV',
        travelMode: user.travelMode || prev.travelMode || 'Solo'
      }));
    }

    const fetchExistingProfile = async () => {
      try {
        const dashboardData = await apiService.getDashboard().catch(() => null);
        if (dashboardData) {
          const prof = dashboardData.profile;
          const u = dashboardData.user;
          setFormData((prev) => ({
            ...prev,
            fullName: user?.fullName || u?.name || prev.fullName || '',
            age: prof?.age ? String(prof.age) : prev.age,
            medicalCondition: prof?.medicalInformation || prev.medicalCondition || 'None',
            vehicleType: prof?.vehicleType || prev.vehicleType || 'EV',
            travelMode: prev.travelMode || 'Solo'
          }));
        }
      } catch (err) {
        console.warn('Could not load profile from dashboard', err);
      }
    };

    fetchExistingProfile();
  }, [user]);

  // Validation function with clear feedback
  const validate = () => {
    const errs = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    if (!formData.age || !String(formData.age).trim()) {
      errs.age = 'Please enter your age.';
    } else {
      const numAge = Number(formData.age);
      if (isNaN(numAge) || numAge < 1 || numAge > 120) {
        errs.age = 'Please enter a valid age between 1 and 120.';
      }
    }
    if (!formData.vehicleType) {
      errs.vehicleType = 'Please select a vehicle type.';
    }
    if (!formData.travelMode) {
      errs.travelMode = 'Please select a travel mode.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const totalFields = 5;

    if (formData.fullName && formData.fullName.trim()) completed += 1;
    if (formData.age && String(formData.age).trim()) completed += 1;
    if (formData.medicalCondition) completed += 1;
    if (formData.vehicleType) completed += 1;
    if (formData.travelMode) completed += 1;

    return Math.round((completed / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setSuccessAlert('');
    setErrorAlert('');

    if (!validate()) {
      setErrorAlert('Please fill in the required fields (Full Name, Age, Vehicle Type) to continue.');
      // Scroll to the first error smoothly
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    try {
      await updateProfile(formData);
      setSuccessAlert('Profile saved successfully! Redirecting...');
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 900);
    } catch (err) {
      setErrorAlert(err.message || 'Failed to save profile. Please check your connection and try again.');
    }
  };

  const handleSkip = () => {
    navigate(user?.isProfileComplete ? ROUTES.DASHBOARD : ROUTES.PLAN_JOURNEY);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user?.isProfileComplete ? 'Profile Management' : 'Travel Profile Setup'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              User Profile Configuration
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {user?.isProfileComplete
                ? 'Update your health sensitivities, vehicle specs, and travel modes anytime.'
                : 'Complete your traveler profile to get personalized clean-air and safe route recommendations.'}
            </p>
          </div>
        </div>

        {/* Profile Completion Progress Indicator */}
        <Card className="p-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600 text-sm" />
              Profile Completion Status
            </span>
            <span className="text-base font-black text-emerald-700">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </Card>

        {/* Existing Saved Profile Summary Card if completed */}
        {user?.isProfileComplete && <ProfileCard user={{ ...user, ...formData }} />}

        {/* Alert Messages */}
        {successAlert && <Alert type="success" message={successAlert} />}
        {errorAlert && (
          <div className="flex items-center gap-2">
            <Alert type="error" message={errorAlert} className="w-full" />
          </div>
        )}

        {/* Profile Onboarding Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8" noValidate>
          
          {/* Section 1: Personal Information */}
          <Card className="p-6 sm:p-7 space-y-6 bg-white/95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200/60">
                <FaUserEdit />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">Full Name & Age for personalized health parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Alex Traveler"
                error={fieldErrors.fullName}
                required
              />

              <InputField
                label="Age"
                name="age"
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 28"
                error={fieldErrors.age}
                required
              />
            </div>
          </Card>

          {/* Section 2: Medical Information (Optional) */}
          <Card className="p-6 sm:p-7 space-y-6 bg-white/95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg border border-teal-200/60">
                <FaHeartbeat />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Medical Information (Optional)</h3>
                <p className="text-xs text-slate-500">Helps EcoRoute prioritize lower AQI clean zones if respiratory sensitive</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="medicalCondition" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Medical Condition
              </label>
              <select
                id="medicalCondition"
                name="medicalCondition"
                value={formData.medicalCondition}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300/90 focus:border-emerald-500 focus:ring-emerald-500/15 text-slate-900 text-sm font-medium rounded-xl py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-4 cursor-pointer"
              >
                {MEDICAL_CONDITIONS.map((cond) => (
                  <option key={cond.id} value={cond.label}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Section 3: Vehicle Type (Radio Buttons) */}
          <Card className="p-6 sm:p-7 space-y-6 bg-white/95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200/60">
                <FaCar />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vehicle Specification</h3>
                <p className="text-xs text-slate-500">Used to estimate fuel consumption and EV charging radar</p>
              </div>
            </div>

            {fieldErrors.vehicleType && (
              <p className="text-xs text-rose-600 font-semibold">{fieldErrors.vehicleType}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {VEHICLE_TYPES.map((type) => {
                const isSelected = (formData.vehicleType || '').toLowerCase() === (type.id || '').toLowerCase();
                return (
                  <label
                    key={type.id}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/20 scale-[1.02]'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={type.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-3xl">{type.icon}</span>
                    <span className="text-xs font-black tracking-wide">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Section 4: Travel Mode */}
          <Card className="p-6 sm:p-7 space-y-6 bg-white/95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg border border-teal-200/60">
                <FaUsers />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Travel Companion Mode</h3>
                <p className="text-xs text-slate-500">Customizes pit-stop suggestions (e.g. family-friendly rest stops vs solo express)</p>
              </div>
            </div>

            {fieldErrors.travelMode && (
              <p className="text-xs text-rose-600 font-semibold">{fieldErrors.travelMode}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {TRAVEL_MODES.map((mode) => {
                const isSelected = (formData.travelMode || '').toLowerCase() === (mode.label || '').toLowerCase();
                return (
                  <label
                    key={mode.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/20'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="travelMode"
                      value={mode.label}
                      checked={isSelected}
                      onChange={handleChange}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-black text-slate-900">{mode.label}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Action Buttons: Save & Continue + Skip for Now */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSkip}
              icon={FaForward}
              className="w-full sm:w-auto"
            >
              Skip for Now
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              loading={loading}
              icon={FaSave}
              className="w-full sm:w-auto px-8 py-4 text-base font-black shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Save & Continue
            </Button>
          </div>

        </form>

      </div>
    </MainLayout>
  );
}
