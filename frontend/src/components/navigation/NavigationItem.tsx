import React from 'react';
import { useThemeStore } from '../../store/themeStore';

interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick
}) => {
  const { theme } = useThemeStore();
  
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 p-2 rounded-lg w-full text-left transition-colors"
      style={{ 
        backgroundColor: isActive ? `${theme.colors.primary}10` : 'transparent',
        color: isActive ? theme.colors.primary : theme.colors.foreground,
        ':hover': { backgroundColor: isActive ? `${theme.colors.primary}15` : `${theme.colors.muted}10` }
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default NavigationItem;