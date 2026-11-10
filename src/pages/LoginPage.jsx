import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const err = {};
    if (!email.trim()) {
      err.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      err.email = 'Please enter a valid email format';
    }

    if (!password) {
      err.password = 'Password is required';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const user = await login(email, password);
      // Redirection logic: First login / incomplete profile -> Profile, else -> Dashboard
      if (!user.isProfileComplete) {
        navigate(ROUTES.PROFILE);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <AuthLayout title="Login to EcoRoute" subtitle="Access smart environmental route optimization">
      {location.state?.verifiedMessage && (
        <Alert type="success" message={location.state.verifiedMessage} className="mb-4" />
      )}
      {new URLSearchParams(location.search).get('expired') === 'true' && (
        <Alert type="error" message="Your session has expired. Please login again." className="mb-4" />
      )}
      {serverError && (
        <div className="mb-4 space-y-2">
          <Alert type="error" message={serverError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Address */}
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="username@example.com"
          icon={FaEnvelope}
          error={errors.email}
          required
        />

        {/* Password with Show/Hide toggle */}
        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span>Remember Me</span>
          </label>

          <button
            type="button"
            onClick={() => setForgotModalOpen(true)}
            className="font-medium text-green-700 hover:text-green-800 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={FaSignInAlt}
          >
            Login
          </Button>
        </div>

        {/* Quick Demo Access Button */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-950 block">Instant Demo Access</span>
            <span className="text-emerald-700 text-[11px]">1-click auto-fill credentials</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('demo@ecoroute.com');
              setPassword('123456');
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-xs"
          >
            Auto-Fill Demo
          </button>
        </div>

        {/* Create Account Link */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-green-700 hover:text-green-800 underline">
              Create an Account
            </Link>
          </p>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setResetSent(false);
        }}
        title="Reset Password"
      >
        {resetSent ? (
          <div className="space-y-4">
            <Alert type="success" message="Password reset instructions sent to your email!" />
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setForgotModalOpen(false);
                setResetSent(false);
              }}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter your registered email address to receive password reset instructions.
            </p>
            <InputField
              label="Email Address"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="username@example.com"
              icon={FaEnvelope}
              required
            />
            <Button type="submit" variant="primary" fullWidth>
              Send Reset Instructions
            </Button>
          </form>
        )}
      </Modal>

    </AuthLayout>
  );
}
