import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import { ROUTES } from '../utils/constants';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-5 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden bg-mesh-radial">
      {/* Background Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none animate-float-delayed" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group mb-3 sm:mb-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-xl shadow-emerald-600/30 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <FaLeaf className="transition-transform group-hover:scale-110" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block leading-tight">
              Eco<span className="text-gradient-emerald">Route</span>
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Environmental Travel Portal
            </span>
          </div>
        </Link>
        {title && <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>}
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="mt-4 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-6 sm:py-7 px-5 sm:px-8 shadow-2xl shadow-emerald-900/10 border border-slate-200/90 rounded-2xl sm:rounded-3xl">
          {children}
        </div>
      </div>
    </div>
  );
}
