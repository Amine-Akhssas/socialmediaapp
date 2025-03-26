import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      backgroundColor: theme.colors.background,
      color: theme.colors.foreground,
      backgroundImage: `radial-gradient(${theme.colors.primary}05 1px, transparent 1px)`,
      backgroundSize: '30px 30px'
    }}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
        {children}
      </main>
      <footer className="py-6 border-t" style={{ 
        color: theme.colors.muted,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card
      }}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-lg font-bold" style={{ color: theme.colors.foreground }}>SocialApp</span>
              </div>
              <p className="text-sm mt-1" style={{ color: theme.colors.muted }}>
                Connect with friends and the world around you.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <a href="#" className="hover:text-primary transition-colors" style={{ color: theme.colors.muted }}>About</a>
              <a href="#" className="hover:text-primary transition-colors" style={{ color: theme.colors.muted }}>Privacy</a>
              <a href="#" className="hover:text-primary transition-colors" style={{ color: theme.colors.muted }}>Terms</a>
              <a href="#" className="hover:text-primary transition-colors" style={{ color: theme.colors.muted }}>Help Center</a>
              <a href="#" className="hover:text-primary transition-colors" style={{ color: theme.colors.muted }}>Contact</a>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t text-center text-xs" style={{ borderColor: theme.colors.border }}>
            © {new Date().getFullYear()} SocialApp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;