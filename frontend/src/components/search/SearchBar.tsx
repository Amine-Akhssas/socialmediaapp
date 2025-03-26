import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Hash, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { searchAPI } from '../../lib/api';
import { SearchResults } from '../../types';
import Avatar from '../ui/Avatar';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = 'Search...', 
  onClose,
  isMobile = false
}) => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], posts: [], hashtags: [] });
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else {
        setResults({ users: [], posts: [], hashtags: [] });
        setShowResults(false);
      }
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await searchAPI.search(query);
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      // In case of error, we'll use empty results
      setResults({ users: [], posts: [], hashtags: [] });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setResults({ users: [], posts: [], hashtags: [] });
    setShowResults(false);
  };
  
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    if (onClose) onClose();
  };
  
  const handlePostClick = (postId: string) => {
    // In a real app, you would navigate to the post detail page
    // navigate(`/post/${postId}`);
    setShowResults(false);
    if (onClose) onClose();
  };
  
  const handleHashtagClick = (hashtag: string) => {
    // In a real app, you would navigate to the hashtag search results
    // navigate(`/hashtag/${hashtag.substring(1)}`);
    setShowResults(false);
    if (onClose) onClose();
  };
  
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} style={{ color: theme.colors.muted }} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (query.trim().length >= 2) setShowResults(true);
          }}
          className="w-full py-2 pl-10 pr-10 rounded-full text-sm transition-all focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: `${theme.colors.muted}15`,
            color: theme.colors.foreground,
            borderColor: 'transparent',
            boxShadow: focused ? `0 0 0 2px ${theme.colors.primary}40` : 'none'
          }}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 rounded-full" style={{ 
                borderColor: `${theme.colors.muted} transparent ${theme.colors.muted} transparent` 
              }}></div>
            ) : (
              <button onClick={handleClear}>
                <X size={16} style={{ color: theme.colors.muted }} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 mt-2 w-full rounded-lg shadow-lg overflow-hidden ${isMobile ? 'max-h-[70vh]' : 'max-h-[60vh]'} overflow-y-auto`}
            style={{ 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              boxShadow: `0 4px 6px -1px ${theme.colors.foreground}10, 0 2px 4px -1px ${theme.colors.foreground}10`
            }}
          >
            {/* Users */}
            {results.users.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold mb-2 px-2" style={{ color: theme.colors.muted }}>
                  PEOPLE
                </h3>
                <div className="space-y-2">
                  {results.users.map(user => (
                    <div 
                      key={user._id}
                      onClick={() => handleUserClick(user._id)}
                      className="flex items-center p-2 rounded-md cursor-pointer hover:bg-opacity-10 transition-colors"
                      style={{ 
                        ':hover': { backgroundColor: `${theme.colors.muted}10` }
                      }}
                    >
                      <Avatar 
                        src={user.avatar} 
                        username={user.username} 
                        size="sm"
                      />
                      <div className="ml-2">
                        <p className="font-medium text-sm" style={{ color: theme.colors.foreground }}>
                          {user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs truncate max-w-[200px]" style={{ color: theme.colors.muted }}>
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            
            {/* Posts */}
            {results.posts.length > 0 && (
              <div className="p-3 border-t" style={{ borderColor: theme.colors.border }}>
                <h3 className="text-xs font-semibold mb-2 px-2" style={{ color: theme.colors.muted }}>
                  POSTS
                </h3>
                <div className="space-y-2">
                  {results.posts.map(post => (
                    <div 
                      key={post._id}
                      onClick={() => handlePostClick(post._id)}
                      className="flex items-center p-2 rounded-md cursor-pointer hover:bg-opacity-10 transition-colors"
                      style={{ 
                        ':hover': { backgroundColor: `${theme.colors.muted}10` }
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${theme.colors.secondary}15` }}
                      >
                        <FileText size={16} style={{ color: theme.colors.secondary }} />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm truncate max-w-[200px]" style={{ color: theme.colors.foreground }}>
                          {post.content}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.muted }}>
                          by {post.author.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* No Results */}
            {results.users.length === 0 && results.posts.length === 0 && results.hashtags.length === 0 && (
              <div className="p-6 text-center">
                <p style={{ color: theme.colors.muted }}>No results found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;