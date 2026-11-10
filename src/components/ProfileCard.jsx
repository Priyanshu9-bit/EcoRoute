import React from 'react';
import Card from './Card';
import { FaUserCircle, FaCar, FaHeartbeat, FaUsers } from 'react-icons/fa';

export default function ProfileCard({ user, onEdit }) {
  if (!user) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold border-2 border-green-300">
            <FaUserCircle />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user.fullName || 'User'}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {user.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
            </span>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <FaCar className="text-green-600 text-lg" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Vehicle Type</p>
            <p className="font-semibold text-slate-800">{user.vehicleType || 'Not set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <FaUsers className="text-green-600 text-lg" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Travel Mode</p>
            <p className="font-semibold text-slate-800">{user.travelMode || 'Not set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <FaHeartbeat className="text-green-600 text-lg" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Medical Condition</p>
            <p className="font-semibold text-slate-800 capitalize">{user.medicalCondition || 'None'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
