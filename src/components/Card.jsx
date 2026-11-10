import React from 'react';

export default function Card({
  children,
  className = '',
  highlight = false,
  onClick,
  hoverable = true,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-md rounded-2xl border transition-all duration-300 ${
        highlight
          ? 'border-emerald-500 bg-emerald-50/60 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/25'
          : 'border-slate-200/80 shadow-xs hover:border-emerald-300/80 hover:shadow-md hover:shadow-emerald-500/5'
      } ${hoverable ? 'hover:-translate-y-1' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
