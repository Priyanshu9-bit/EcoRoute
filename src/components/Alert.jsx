import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200 icon-green-600',
    error: 'bg-red-50 text-red-800 border-red-200 icon-red-600',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 icon-amber-600',
    info: 'bg-blue-50 text-blue-800 border-blue-200 icon-blue-600'
  };

  const icons = {
    success: FaCheckCircle,
    error: FaTimesCircle,
    warning: FaExclamationTriangle,
    info: FaInfoCircle
  };

  const IconComponent = icons[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} text-sm ${className}`}>
      <IconComponent className="text-lg shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 font-bold ml-2">
          ✕
        </button>
      )}
    </div>
  );
}
