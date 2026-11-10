import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 focus:ring-emerald-500',
    secondary: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-xs hover:shadow-sm hover:-translate-y-0.5 focus:ring-emerald-400',
    outline: 'border-2 border-emerald-600/90 text-emerald-700 hover:bg-emerald-50/80 hover:border-emerald-600 focus:ring-emerald-500',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 hover:-translate-y-0.5 focus:ring-rose-500',
    ghost: 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/80 focus:ring-slate-400 shadow-none'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 shadow-md'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="text-lg" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
