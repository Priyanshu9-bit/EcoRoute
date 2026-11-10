import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaGithub, FaLinkedin, FaMobileAlt } from 'react-icons/fa';
import { ROUTES } from '../utils/constants';
import InstallAppModal from './InstallAppModal';

export default function Footer() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & About */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center text-lg shadow-xs">
                <FaLeaf />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Eco<span className="text-green-600">Route</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              About EcoRoute: Smart Environmental Route Recommendation System. EcoRoute helps travelers choose cleaner, safer, and optimized routes by evaluating real-time weather, air quality, road safety, and personal preferences.
            </p>

            {/* Social / Portfolio Placeholders */}
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-green-100 hover:text-green-700 flex items-center justify-center text-sm transition-colors"
                aria-label="GitHub Repository"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-green-100 hover:text-green-700 flex items-center justify-center text-sm transition-colors"
                aria-label="LinkedIn Profile"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation & Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Features & Pages</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-green-600 transition-colors">About EcoRoute</Link>
              </li>
              <li>
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="hover:text-green-600 transition-colors flex items-center gap-1.5 cursor-pointer text-left font-semibold text-emerald-700"
                >
                  <FaMobileAlt className="text-emerald-500" />
                  <span>Download Mobile App (APK / PWA)</span>
                </button>
              </li>
              <li>
                <a href="#features-section" className="hover:text-green-600 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-green-600 transition-colors">How EcoRoute Works</a>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-green-600 transition-colors">Why Choose EcoRoute</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-green-600 shrink-0" />
                <span>contact@ecoroute.project</span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-green-600 shrink-0" />
                <span>+1 (800) 555-ECOROUTE</span>
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600 shrink-0" />
                <span>Department of Computer Science & Engineering</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Privacy & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Privacy & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-green-600 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-green-600 transition-colors">Terms & Conditions</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} EcoRoute Major Project. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium text-slate-500">
            EcoRoute – Smart Environmental Route Recommendation System
          </p>
        </div>
      </div>

      <InstallAppModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </footer>
  );
}
