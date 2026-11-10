import React from 'react';

const VehicleSelector = ({ selected, onChange }) => {
  const vehicles = ['CAR', 'BIKE', 'BUS', 'TRUCK', 'EV'];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
      <div className="flex flex-wrap gap-2">
        {vehicles.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              selected === v
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelector;
