import React from 'react';
import Card from './Card';

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = 'green', trend }) {
  const colorClasses = {
    green: 'bg-green-100/80 text-green-700',
    blue: 'bg-blue-100/80 text-blue-700',
    amber: 'bg-amber-100/80 text-amber-700',
    purple: 'bg-purple-100/80 text-purple-700'
  };
  return (
    <Card className="p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-extrabold text-slate-900">{value}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        {trend && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">{trend}</span>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorClasses[color] || colorClasses.green}`}>
          <Icon />
        </div>
      )}
    </Card>
  );
}
