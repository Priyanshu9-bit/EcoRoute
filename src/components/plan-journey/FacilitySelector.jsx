import React from 'react';

const FacilitySelector = ({ selectedFacilities, onChange }) => {
  const facilities = ['HOSPITAL', 'HOTEL', 'RESTAURANT', 'GARAGE', 'FUEL_STATION', 'EV_CHARGING'];

  const toggleFacility = (facility) => {
    if (selectedFacilities.includes(facility)) {
      onChange(selectedFacilities.filter(f => f !== facility));
    } else {
      onChange([...selectedFacilities, facility]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Required Facilities</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {facilities.map((facility) => (
          <label key={facility} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selectedFacilities.includes(facility)}
              onChange={() => toggleFacility(facility)}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{facility.replace('_', ' ')}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FacilitySelector;
