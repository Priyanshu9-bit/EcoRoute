import React from 'react';
import Card from './Card';
import {
  FaRoute,
  FaCloudSun,
  FaWind,
  FaExclamationTriangle,
  FaHospital,
  FaUtensils,
  FaGasPump,
  FaAmbulance,
  FaUserCheck,
  FaChartLine,
  FaLeaf,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaCheckCircle
} from 'react-icons/fa';

const iconMap = {
  FaRoute,
  FaCloudSun,
  FaWind,
  FaExclamationTriangle,
  FaHospital,
  FaUtensils,
  FaGasPump,
  FaAmbulance,
  FaUserCheck,
  FaChartLine,
  FaLeaf,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaCheckCircle
};

export default function FeatureCard({ title, description, iconName }) {
  const IconComponent = iconMap[iconName] || FaRoute;

  return (
    <Card className="p-6 flex flex-col h-full group relative overflow-hidden bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125 duration-500" />
      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-700 flex items-center justify-center text-xl mb-4 group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-md group-hover:shadow-emerald-600/30 transition-all duration-300 shrink-0 border border-emerald-200/50">
        <IconComponent />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
        {description}
      </p>
    </Card>
  );
}
