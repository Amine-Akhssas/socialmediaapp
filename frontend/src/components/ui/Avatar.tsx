import React from 'react';
import { useThemeStore } from '../../store/themeStore';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  username?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  username,
  className = '',
  style = {},
}) => {
  const { theme } = useThemeStore();
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-28 h-28 text-xl',
  };

  // Get initials from username or alt text
  const getInitials = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return alt.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: src ? 'transparent' : theme.colors.primary,
        boxShadow: `0 0 0 2px ${theme.colors.background}`,
        ...style
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-medium text-white">{getInitials()}</span>
      )}
    </div>
  );
};

export default Avatar;