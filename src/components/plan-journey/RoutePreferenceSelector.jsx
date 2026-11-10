import React from 'react';

const RoutePreferenceSelector = ({ selectedPrefs, onChange }) => {
  const prefs = ['SHORTEST', 'FASTEST', 'SAFEST', 'HEALTHIEST'];

  const togglePref = (pref) => {
    if (selectedPrefs.includes(pref)) {
      onChange(selectedPrefs.filter(p => p !== pref));
    } else {
      onChange([...selectedPrefs, pref]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Route Preferences</label>
      <div className="grid grid-cols-2 gap-2">
        {prefs.map((pref) => (
          <label key={pref} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selectedPrefs.includes(pref)}
              onChange={() => togglePref(pref)}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{pref} Route</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RoutePreferenceSelector;
