import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaAndroid, FaApple, FaMobileAlt, 
  FaDownload, FaCheckCircle, FaQrcode, FaShieldAlt, 
  FaVolumeUp, FaLeaf, FaMapMarkedAlt 
} from 'react-icons/fa';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios' | 'qr'

  useEffect(() => {
    // Check if app is already running in standalone/PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setInstalling(false);
    } else {
      // In browsers without direct prompt event, guide the user
      alert('To install EcoRoute:\n1. On Android Chrome: Tap menu (⋮) -> "Add to Home Screen" or "Install App".\n2. On iPhone Safari: Tap Share (⬆️) -> "Add to Home Screen".');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ecoroute.vercel.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Glow Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🌱
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white font-heading">EcoRoute Mobile</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  v1.2.0
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">Smart Environmental Navigation Cockpit</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'android' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaAndroid className="text-sm" />
            <span>Android (APK)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'pwa' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaMobileAlt className="text-sm" />
            <span>Web App (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'qr' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FaQrcode className="text-sm" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Tab 1: Android APK */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  <FaAndroid />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Android App (.apk)</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Install the native standalone Android build directly on any phone without needing the Google Play Store.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleInstallPWA}
                  disabled={installing}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <FaMobileAlt />
                  <span>{deferredPrompt ? '1-Tap Add to Home Screen' : 'Install Instant App (PWA)'}</span>
                </button>
                <a
                  href="/downloads/EcoRoute.apk"
                  download="EcoRoute.apk"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                >
                  <FaAndroid />
                  <span>Download Standalone APK</span>
                </a>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Quick Installation Steps:</div>
                <div>1. Tap <strong>Download EcoRoute APK</strong> above.</div>
                <div>2. If prompted by your browser, tap <strong>"Install anyway"</strong>.</div>
                <div>3. Open the app to enjoy full voice turn-by-turn cockpit and AQI navigation!</div>
              </div>
            </div>
          )}

          {/* Tab 2: PWA */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-xl shrink-0">
                  <FaMobileAlt />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant Progressive Web App (PWA)</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Zero storage consumption. Instantly adds an app icon to your phone screen with offline caching, high-speed loading, and full-screen display.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400">
                  <FaCheckCircle className="text-xl" />
                  <span className="text-sm font-semibold">EcoRoute is already installed on this device!</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallPWA}
                  disabled={installing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                >
                  <FaDownload />
                  <span>{deferredPrompt ? 'Add EcoRoute to Home Screen' : 'Install Instant App'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-slate-400">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Android (Chrome/Edge):</span>
                  Tap top menu (⋮) ➔ <em>"Add to Home Screen"</em>.
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <span className="text-blue-400 font-bold block mb-1">iOS (Safari):</span>
                  Tap Share (⬆️) ➔ <em>"Add to Home Screen"</em>.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center space-y-4 animate-fade-in text-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                <img 
                  src={qrCodeUrl} 
                  alt="Scan EcoRoute App QR Code" 
                  className="w-48 h-48 rounded-lg"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Scan with your Phone Camera</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Scan this QR code with any smartphone camera or QR reader to open EcoRoute and tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* App Feature Highlights */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Included in the Mobile App:
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
                <FaVolumeUp className="text-emerald-400 text-sm mb-1" />
                <span>Voice Navigation</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
                <FaLeaf className="text-emerald-400 text-sm mb-1" />
                <span>Live AQI Heatmap</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
                <FaShieldAlt className="text-red-400 text-sm mb-1" />
                <span>1-Tap SOS Dispatch</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
