import React from 'react';

export default function Input({
  label,
  type = 'text',
  id,
  error,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="font-label-lg text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            <Icon size={20} />
          </span>
        )}
        {type === 'textarea' ? (
          <textarea
            id={id}
            className={`w-full p-4 rounded-xl border border-border-light focus:border-primary input-glow transition-all outline-none bg-white text-body-md resize-none ${error ? 'border-error' : ''} ${Icon ? 'pl-10' : 'px-4'}`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            className={`w-full h-12 rounded-xl border border-border-light focus:border-primary input-glow transition-all outline-none bg-white text-body-md appearance-none ${error ? 'border-error' : ''} ${Icon ? 'pl-10' : 'px-4'}`}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            className={`w-full h-12 rounded-xl border border-border-light focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white text-body-md ${error ? 'border-error' : ''} ${Icon ? 'pl-10' : 'px-4'}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="text-label-sm text-error mt-1">{error}</span>}
    </div>
  );
}
