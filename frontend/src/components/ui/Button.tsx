import React from 'react';
import { useThemeStore } from '../../store/themeStore';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useThemeStore();

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
          boxShadow: `0 1px 2px ${theme.colors.primary}20`,
          ':hover': { 
            backgroundColor: `${theme.colors.primary}E6`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${theme.colors.primary}30`
          },
          ':active': {
            transform: 'translateY(0)',
            boxShadow: `0 1px 2px ${theme.colors.primary}20`
          }
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: 'white',
          border: 'none',
          boxShadow: `0 1px 2px ${theme.colors.secondary}20`,
          ':hover': { 
            backgroundColor: `${theme.colors.secondary}E6`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${theme.colors.secondary}30`
          },
          ':active': {
            transform: 'translateY(0)',
            boxShadow: `0 1px 2px ${theme.colors.secondary}20`
          }
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.border}`,
          ':hover': { 
            backgroundColor: `${theme.colors.primary}10`,
            borderColor: theme.colors.primary
          }
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.foreground,
          border: 'none',
          ':hover': { backgroundColor: `${theme.colors.muted}15` }
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          color: 'white',
          border: 'none',
          boxShadow: `0 1px 2px ${theme.colors.error}20`,
          ':hover': { 
            backgroundColor: `${theme.colors.error}E6`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${theme.colors.error}30`
          },
          ':active': {
            transform: 'translateY(0)',
            boxShadow: `0 1px 2px ${theme.colors.error}20`
          }
        };
      default:
        return {};
    }
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const variantStyles = getVariantStyles();

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      style={{
        ...variantStyles,
        transition: 'all 0.2s ease'
      }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;