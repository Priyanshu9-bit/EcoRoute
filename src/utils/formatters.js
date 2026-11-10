/**
 * Formatting utility functions
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getAqiBadgeColor = (aqi) => {
  if (aqi == null || aqi === '--') return 'bg-slate-100 text-slate-700 border-slate-300';
  const num = Number(aqi);
  if (isNaN(num)) return 'bg-slate-100 text-slate-700 border-slate-300';
  if (num <= 50) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (num <= 100) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (num <= 150) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-rose-100 text-rose-800 border-rose-300';
};

export const getAqiCategoryText = (aqi) => {
  if (aqi == null || aqi === '--') return 'Unknown';
  const num = Number(aqi);
  if (isNaN(num)) return 'Unknown';
  if (num <= 50) return 'Good';
  if (num <= 100) return 'Moderate';
  if (num <= 150) return 'Unhealthy SG';
  if (num <= 200) return 'Unhealthy';
  if (num <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const formatDistance = (dist) => {
  if (dist == null || dist === '' || dist === 'N/A') return 'N/A';
  const num = parseFloat(dist);
  if (isNaN(num)) return String(dist);
  if (num < 1) {
    return `${Math.round(num * 1000)} m`;
  }
  return `${Number(num.toFixed(2))} km`;
};

export const formatDurationDetailed = (val) => {
  if (val == null || val === '' || val === 'N/A') return 'N/A';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);

  // If in seconds (OSRM stores route duration in seconds, e.g. 18000s = 300m = 5h)
  let totalMinutes;
  if (num > 3600 || !Number.isInteger(num)) {
    totalMinutes = Math.round(num / 60);
  } else if (num >= 60 && num <= 1000) {
    // If it's already in minutes (e.g. 300 mins) or seconds (300s = 5 mins)
    // In EcoRoute, route.duration in DB is seconds from OSRM
    totalMinutes = Math.round(num / 60);
  } else {
    totalMinutes = Math.round(num / 60) || Math.round(num);
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
  }
  return `${totalMinutes} min${totalMinutes !== 1 ? 's' : ''}`;
};

export const getStatusBadge = (status) => {
  switch (String(status).toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'planned':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

