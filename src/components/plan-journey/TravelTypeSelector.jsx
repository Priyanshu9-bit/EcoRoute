import React from 'react';

const TravelTypeSelector = ({ selected, onChange }) => {
  const types = ['SOLO', 'FRIENDS', 'FAMILY'];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Travel Type</label>
      <div className="flex gap-4">
        {types.map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="travelType"
              value={type}
              checked={selected === type}
              onChange={() => onChange(type)}
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-700">{type}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TravelTypeSelector;
