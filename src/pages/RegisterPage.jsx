import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { checkPasswordStrength, apiService } from '../services/api';
import { ROUTES } from '../utils/constants';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserCheck,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaKey
} from 'react-icons/fa';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, logout, loading } = useAuth();

  useEffect(() => {
    // Clean up any stale active session when entering registration
    if (localStorage.getItem('ecoroute_token')) {
      logout();
    }
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const pwdInfo = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    // 2. Email Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., username@example.com)';
    }

    // 3. Password Validation (At least 6 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    // 4. Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const isValid = await validateForm();
    if (!isValid) {
      setServerError('Please fix the errors below before submitting.');
      return;
    }

    try {
      await register(formData.fullName, formData.email, formData.password);
      
      // Seamless immediate login
      try {
        await login(formData.email, formData.password);
        navigate(ROUTES.PROFILE);
      } catch {
        navigate(ROUTES.LOGIN, { 
          state: { 
            registeredEmail: formData.email, 
            verifiedMessage: 'Account created successfully. Please login to continue.' 
          } 
        });
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setServerError('Registration Failed. Email is already registered. Please login instead.');
      } else {
        setServerError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Sign up for EcoRoute smart environmental navigation"
    >
      {serverError && <Alert type="error" message={serverError} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <InputField
          label="Full Name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="e.g. Dr. Alex Rivera"
          icon={FaUser}
          error={errors.fullName}
          required
        />

        {/* Email Address */}
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="username@example.com"
          icon={FaEnvelope}
          error={errors.email}
          required
        />

        {/* Password */}
        <div>
          <InputField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={FaLock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
            error={errors.password}
            required
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Password Strength:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold border ${pwdInfo.strengthColor}`}>
                  {pwdInfo.strength}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    pwdInfo.strength === 'Strong'
                      ? 'bg-green-600'
                      : pwdInfo.strength === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${pwdInfo.scorePercent}%` }}
                />
              </div>

              {/* Requirement checklist */}
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                <span className={`flex items-center gap-1 ${pwdInfo.requirements.length ? 'text-green-700 font-semibold' : 'text-slate-400'}`}>
                  {pwdInfo.requirements.length ? <FaCheckCircle /> : <FaTimesCircle />} 6+ Characters
                </span>
                <span className={`flex items-center gap-1 ${pwdInfo.requirements.uppercase ? 'text-green-700 font-semibold' : 'text-slate-400'}`}>
                  {pwdInfo.requirements.uppercase ? <FaCheckCircle /> : <FaTimesCircle />} Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1 ${pwdInfo.requirements.lowercase ? 'text-green-700 font-semibold' : 'text-slate-400'}`}>
                  {pwdInfo.requirements.lowercase ? <FaCheckCircle /> : <FaTimesCircle />} Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1 ${pwdInfo.requirements.number ? 'text-green-700 font-semibold' : 'text-slate-400'}`}>
                  {pwdInfo.requirements.number ? <FaCheckCircle /> : <FaTimesCircle />} Number (0-9)
                </span>
                <span className={`flex items-center gap-1 ${pwdInfo.requirements.special ? 'text-green-700 font-semibold' : 'text-slate-400'} col-span-2`}>
                  {pwdInfo.requirements.special ? <FaCheckCircle /> : <FaTimesCircle />} Special Char (@,#,$,%,*,!)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          icon={FaLock}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
          error={errors.confirmPassword}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={FaUserCheck}
          >
            Create Account
          </Button>
        </div>

        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-green-700 hover:text-green-800 underline">
              Login
            </Link>
          </p>
        </div>
      </form>

    </AuthLayout>
  );
}
