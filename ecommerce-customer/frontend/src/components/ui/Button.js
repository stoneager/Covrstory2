import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-200 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-200',
    outline: 'bg-transparent border-2 border-secondary-300 text-secondary-700 hover:border-secondary-400 hover:bg-secondary-50 focus:ring-secondary-200',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus:ring-accent-200 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-200 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <FontAwesomeIcon icon={icon} />}
          {children}
          {icon && iconPosition === 'right' && <FontAwesomeIcon icon={icon} />}
        </>
      )}
    </button>
  );
};

export default Button;
