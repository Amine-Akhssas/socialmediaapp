import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Moon, Sun, Settings, Bell, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import SearchBar from '../search/SearchBar';
import { usersAPI } from '../../lib/api';

const Navbar: React.FC = () => {
  const { isAuthenticated, user: _user, logout } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const refreshUser = async (userId: string) => {
    return (await usersAPI.getUser(userId)).data
  }
  useEffect(() => {
    if (_user?._id) {
      refreshUser(_user._id)
        .then((fetchedUser) => {
          setUser(fetchedUser);
        })
        .catch((error) => {
          console.error('Failed to refresh user:', error);
        });
    }
  }, [_user]);
  const { currentTheme, theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{
      backgroundColor: `${theme.colors.background}95`,
      borderColor: theme.colors.border
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: theme.colors.foreground }}>SocialApp</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                style={{
                  backgroundColor: isActive('/') ? `${theme.colors.primary}15` : 'transparent',
                  color: isActive('/') ? theme.colors.primary : theme.colors.foreground
                }}
              >
                <div className="flex items-center space-x-1">
                  <Home size={18} />
                  <span>Home</span>
                </div>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                  style={{
                    backgroundColor: isActive('/profile') ? `${theme.colors.primary}15` : 'transparent',
                    color: isActive('/profile') ? theme.colors.primary : theme.colors.foreground
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <User size={18} />
                    <span>Profile</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <SearchBar className="w-full" />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
              style={{ backgroundColor: `${theme.colors.muted}10` }}
              aria-label="Toggle theme"
            >
              {currentTheme === 'light' ? (
                <Moon size={18} style={{ color: theme.colors.foreground }} />
              ) : (
                <Sun size={18} style={{ color: theme.colors.foreground }} />
              )}
            </button>

            {isAuthenticated && (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                    style={{ backgroundColor: `${theme.colors.muted}10` }}
                    aria-label="Notifications"
                  >
                    <Bell size={18} style={{ color: theme.colors.foreground }} />
                    {notifications > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full text-xs text-white font-bold flex items-center justify-center bg-red-500">
                        {notifications}
                      </span>
                    )}
                  </button>
                </div>

                {/* Settings */}
                <Link
                  to="/settings"
                  className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                  style={{ backgroundColor: `${theme.colors.muted}10` }}
                  aria-label="Settings"
                >
                  <Settings size={18} style={{ color: theme.colors.foreground }} />
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Avatar
                      src={user?.avatar}
                      username={user?.username}
                      size="sm"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50"
                      style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        boxShadow: `0 4px 6px -1px ${theme.colors.foreground}10, 0 2px 4px -1px ${theme.colors.foreground}10`
                      }}
                    >
                      <div className="px-4 py-2 border-b" style={{ borderColor: theme.colors.border }}>
                        <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>{user?.username}</p>
                        <p className="text-xs truncate" style={{ color: theme.colors.muted }}>{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-opacity-10 transition-colors"
                        style={{
                          color: theme.colors.foreground,
                          backgroundColor: `${theme.colors.muted}10`
                        }}
                      >
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Profile</span>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 transition-colors"
                        style={{
                          color: theme.colors.foreground,
                          backgroundColor: `${theme.colors.muted}10`
                        }}
                      >
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={20} style={{ color: theme.colors.foreground }} />
              ) : (
                <Menu size={20} style={{ color: theme.colors.foreground }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
            style={{ backgroundColor: theme.colors.card }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 border-b" style={{ borderColor: theme.colors.border }}>
              {/* Search Bar - Mobile */}
              <div className="px-3 py-2">
                <SearchBar isMobile={true} onClose={() => setMobileMenuOpen(false)} />
              </div>

              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-opacity-10' : ''}`}
                style={{
                  backgroundColor: isActive('/') ? `${theme.colors.primary}15` : 'transparent',
                  color: isActive('/') ? theme.colors.primary : theme.colors.foreground
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home size={18} className="mr-2" />
                  <span>Home</span>
                </div>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile') ? 'bg-opacity-10' : ''}`}
                    style={{
                      backgroundColor: isActive('/profile') ? `${theme.colors.primary}15` : 'transparent',
                      color: isActive('/profile') ? theme.colors.primary : theme.colors.foreground
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User size={18} className="mr-2" />
                      <span>Profile</span>
                    </div>
                  </Link>

                  <Link
                    to="/settings"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/settings') ? 'bg-opacity-10' : ''}`}
                    style={{
                      backgroundColor: isActive('/settings') ? `${theme.colors.primary}15` : 'transparent',
                      color: isActive('/settings') ? theme.colors.primary : theme.colors.foreground
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings size={18} className="mr-2" />
                      <span>Settings</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium"
                    style={{ color: theme.colors.foreground }}
                  >
                    <div className="flex items-center">
                      <LogOut size={18} className="mr-2" />
                      <span>Logout</span>
                    </div>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;