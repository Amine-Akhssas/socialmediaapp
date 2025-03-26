import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, User, Bell, Shield, Moon, Sun, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { themes } from '../config/theme';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

const SettingsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { theme, currentTheme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'privacy'>('appearance');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.foreground }}>
              Profile Settings
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Avatar 
                  src={user?.avatar} 
                  username={user?.username} 
                  size="lg" 
                />
                <div className="ml-4">
                  <Button size="sm" variant="outline">
                    Change Avatar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: theme.colors.foreground }}>
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg p-3 border focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      backgroundColor: theme.colors.card,
                      color: theme.colors.foreground,
                      borderColor: theme.colors.border,
                      minHeight: '100px'
                    }}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-6 mt-6" style={{ borderColor: theme.colors.border }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.foreground }}>
                Account Management
              </h3>
              
              <div className="space-y-4">
                <Button variant="outline" fullWidth className="justify-start">
                  Change Password
                </Button>
                
                <Button variant="danger" fullWidth className="justify-start">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.foreground }}>
              Appearance Settings
            </h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: theme.colors.foreground }}>
                <Palette className="mr-2" size={20} />
                Theme
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(themes).map(([themeKey, themeObj]) => (
                  <div 
                    key={themeKey}
                    className={`p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                      currentTheme === themeKey ? 'ring-2' : 'hover:opacity-90'
                    }`}
                    style={{ 
                      backgroundColor: themeObj.colors.card,
                      color: themeObj.colors.foreground,
                      borderColor: themeObj.colors.border,
                      ringColor: themeObj.colors.primary,
                      boxShadow: `0 4px 6px -1px ${themeObj.colors.foreground}10`
                    }}
                    onClick={() => setTheme(themeKey)}
                  >
                    {currentTheme === themeKey && (
                      <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: themeObj.colors.primary }}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{themeObj.name}</h3>
                      {themeKey.includes('dark') ? (
                        <Moon size={16} style={{ color: themeObj.colors.foreground }} />
                      ) : (
                        <Sun size={16} style={{ color: themeObj.colors.foreground }} />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1">
                      {['primary', 'secondary', 'accent', 'background', 'foreground'].map(colorKey => (
                        <div 
                          key={colorKey}
                          className="w-full h-6 rounded"
                          style={{ backgroundColor: themeObj.colors[colorKey as keyof typeof themeObj.colors] }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-6" style={{ borderColor: theme.colors.border }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                Display Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.foreground }}>Reduce Animations</p>
                    <p className="text-sm" style={{ color: theme.colors.muted }}>Minimize motion for accessibility</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.foreground }}>Compact Mode</p>
                    <p className="text-sm" style={{ color: theme.colors.muted }}>Show more content with less spacing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.foreground }}>High Contrast</p>
                    <p className="text-sm" style={{ color: theme.colors.muted }}>Increase contrast for better readability</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.foreground }}>
              Notification Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                  Email Notifications
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>New Followers</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>When someone follows you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Post Likes</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>When someone likes your post</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Comments</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>When someone comments on your post</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6" style={{ borderColor: theme.colors.border }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                  Push Notifications
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Enable Push Notifications</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Receive notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Do Not Disturb</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Silence notifications during certain hours</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.foreground }}>
              Privacy & Security
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                  Account Privacy
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Private Account</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Only approved followers can see your posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Activity Status</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Show when you're active</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6" style={{ borderColor: theme.colors.border }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                  Security
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Two-Factor Authentication</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Add an extra layer of security</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Enable
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Login Activity</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Review devices that have logged into your account</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.foreground }}>Blocked Accounts</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>Manage users you've blocked</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6" style={{ borderColor: theme.colors.border }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.foreground }}>
                  Data & Privacy
                </h3>
                
                <div className="space-y-3">
                  <Button variant="outline" fullWidth className="justify-start">
                    Download Your Data
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    Privacy Policy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8" style={{ color: theme.colors.foreground }}>
            Settings
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <div className="rounded-xl overflow-hidden shadow-sm border" style={{ 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }}>
                  <nav className="p-2">
                    <button
                      className={`w-full flex items-center space-x-2 p-3 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                      style={{ 
                        backgroundColor: activeTab === 'profile' ? `${theme.colors.primary}15` : 'transparent',
                        color: activeTab === 'profile' ? theme.colors.primary : theme.colors.foreground
                      }}
                      onClick={() => setActiveTab('profile')}
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-2 p-3 rounded-lg text-left transition-colors ${activeTab === 'appearance' ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                      style={{ 
                        backgroundColor: activeTab === 'appearance' ? `${theme.colors.primary}15` : 'transparent',
                        color: activeTab === 'appearance' ? theme.colors.primary : theme.colors.foreground
                      }}
                      onClick={() => setActiveTab('appearance')}
                    >
                      <Palette size={18} />
                      <span>Appearance</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-2 p-3 rounded-lg text-left transition-colors ${activeTab === 'notifications' ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                      style={{ 
                        backgroundColor: activeTab === 'notifications' ? `${theme.colors.primary}15` : 'transparent',
                        color: activeTab === 'notifications' ? theme.colors.primary : theme.colors.foreground
                      }}
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Bell size={18} />
                      <span>Notifications</span>
                    </button>
                    
                    <button
                      className={`w-full flex items-center space-x-2 p-3 rounded-lg text-left transition-colors ${activeTab === 'privacy' ? 'bg-opacity-10' : 'hover:bg-opacity-5'}`}
                      style={{ 
                        backgroundColor: activeTab === 'privacy' ? `${theme.colors.primary}15` : 'transparent',
                        color: activeTab === 'privacy' ? theme.colors.primary : theme.colors.foreground
                      }}
                      onClick={() => setActiveTab('privacy')}
                    >
                      <Shield size={18} />
                      <span>Privacy & Security</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="rounded-xl overflow-hidden shadow-sm border p-6" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;