import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import {
  FaLeaf,
  FaHome,
  FaChartLine,
  FaRoute,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
  FaMobileAlt
} from 'react-icons/fa';
import InstallAppModal from './InstallAppModal';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-700 shadow-xs border border-emerald-500/20'
        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/70'
    }`;

  return (
    <header className="sticky top-0 z-50 glass-nav shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg sm:text-xl shadow-md shadow-emerald-600/30 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <FaLeaf className="transition-transform group-hover:scale-110" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Eco<span className="text-gradient-emerald">Route</span>
                </span>
              </div>
              <span className="hidden sm:block text-[9px] uppercase font-bold text-slate-400 tracking-wider -mt-0.5">
                Smart Environmental Routing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/60">
            {isAuthenticated ? (
              <>
                <NavLink to={ROUTES.DASHBOARD} className={navLinkClasses}>
                  <FaChartLine className="text-emerald-600 text-sm" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink to={ROUTES.PLAN_JOURNEY} className={navLinkClasses}>
                  <FaRoute className="text-emerald-600 text-sm" />
                  <span>Plan Journey</span>
                </NavLink>

                <NavLink to={ROUTES.MY_TRIPS} className={navLinkClasses}>
                  <FaHistory className="text-emerald-600 text-sm" />
                  <span>My Trips</span>
                </NavLink>

                <NavLink to={ROUTES.PROFILE} className={navLinkClasses}>
                  <FaUser className="text-emerald-600 text-sm" />
                  <span>Profile</span>
                </NavLink>
              </>
            ) : null}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100/90 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-xs"
              title="Download EcoRoute Mobile App (APK & PWA)"
            >
              <FaMobileAlt className="text-emerald-600 text-sm" />
              <span>Get App</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white tracking-wide">
                APK
              </span>
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-slate-800">{user?.fullName || 'Traveler'}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 transition-all duration-200 hover:shadow-xs cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                >
                  <FaSignInAlt className="text-emerald-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FaUserPlus />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-5 pt-3 pb-5 space-y-2.5 shadow-lg">
          {isAuthenticated ? (
            <>
              <NavLink
                to={ROUTES.DASHBOARD}
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                <FaChartLine className="text-emerald-600" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to={ROUTES.PLAN_JOURNEY}
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                <FaRoute className="text-emerald-600" />
                <span>Plan Journey</span>
              </NavLink>

              <NavLink
                to={ROUTES.MY_TRIPS}
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                <FaHistory className="text-emerald-600" />
                <span>My Trips</span>
              </NavLink>

              <NavLink
                to={ROUTES.PROFILE}
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                <FaUser className="text-emerald-600" />
                <span>Profile</span>
              </NavLink>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
              >
                Get Started
              </Link>
              <button
                onClick={() => {
                  setShowInstallModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-800 border border-emerald-300 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <FaMobileAlt className="text-emerald-600 text-sm" />
                  <span>Download Mobile App (APK / PWA)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                  NEW
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile App Install Modal */}
      <InstallAppModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </header>
  );
}
