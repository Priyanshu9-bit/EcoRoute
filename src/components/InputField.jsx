import React from 'react';

export default function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  rightElement,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-white border ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300/90 focus:border-emerald-500 focus:ring-emerald-500/15'
          } text-slate-900 placeholder-slate-400 text-sm font-medium rounded-xl py-2.5 ${
            Icon ? 'pl-11' : 'pl-3.5'
          } ${rightElement ? 'pr-11' : 'pr-3.5'} transition-all duration-200 focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 shadow-2xs`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 text-slate-400 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
