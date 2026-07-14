import React from 'react';
import { MdRefresh } from 'react-icons/md';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center transition-all font-label-lg active:scale-[0.98] rounded-xl gap-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20',
    secondary: 'bg-white border border-border-light text-on-surface hover:bg-surface-subtle',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'text-primary hover:bg-primary/5'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <MdRefresh className="animate-spin text-lg" />}
      {!isLoading && children}
    </button>
  );
}
