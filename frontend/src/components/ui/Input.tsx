import React, { forwardRef } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const { theme } = useThemeStore();
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.foreground }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: theme.colors.muted }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block rounded-lg shadow-sm 
              ${leftIcon ? 'pl-10' : 'pl-4'} 
              ${rightIcon ? 'pr-10' : 'pr-4'} 
              py-2.5 
              border 
              focus:outline-none 
              focus:ring-2 
              text-sm 
              transition-all
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${widthClass}
              ${className}
            `}
            style={{ 
              backgroundColor: theme.colors.card,
              color: theme.colors.foreground,
              borderColor: error ? theme.colors.error : theme.colors.border,
              boxShadow: `0 1px 2px ${theme.colors.foreground}05`,
              ':focus': {
                borderColor: error ? theme.colors.error : theme.colors.primary,
                boxShadow: `0 0 0 2px ${error ? theme.colors.error : theme.colors.primary}20`
              }
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: theme.colors.error }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;