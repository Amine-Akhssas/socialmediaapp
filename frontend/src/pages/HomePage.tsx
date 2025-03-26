import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Users, Zap, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Post, User, Activity, Hashtag } from '../types';
import Layout from '../components/layout/Layout';
import CreatePostForm from '../components/posts/CreatePostForm';
import PostCard from '../components/posts/PostCard';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import ActivityFeed from '../components/activity/ActivityFeed';
import TrendingHashtags from '../components/hashtags/TrendingHashtags';
import NavigationItem from '../components/navigation/NavigationItem';
import SeeAllModal from '../components/modals/SeeAllModal';
import UserCard from '../components/users/UserCard';
import { postsAPI, usersAPI, hashtagsAPI } from '../lib/api';

const HomePage: React.FC = () => {
  const { isAuthenticated, user: _user } = useAuthStore();
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
  const { theme } = useThemeStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<'discover' | 'friends' | 'popular' | 'trending'>('discover');
  
  // Modal states
  const [showHashtagsModal, setShowHashtagsModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (activeNavItem) {
        case 'friends':
          response = await postsAPI.getFeed();
          break;
        case 'popular':
          response = await postsAPI.getPopularPosts();
          break;
        case 'trending':
          response = await postsAPI.getTrendingPosts();
          break;
        case 'discover':
        default:
          response = await postsAPI.getAllPosts();
          break;
      }
      
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSuggestedUsers = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await usersAPI.getSuggestions();
      setSuggestedUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch suggested users:', 
        err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  const fetchActivity = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingActivity(true);
    try {
      const response = await usersAPI.getActivity();
      setRecentActivity(response.data);
    } catch (err) {
      console.error('Failed to fetch activity:', 
        err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingActivity(false);
    }
  };
  
  const fetchTrendingHashtags = async () => {
    setIsLoadingHashtags(true);
    try {
      const response = await hashtagsAPI.getTrending();
      setTrendingHashtags(response.data);
    } catch (err) {
      console.error('Failed to fetch trending hashtags:', 
        err instanceof Error ? err.message : String(err));
      setTrendingHashtags([]);
    } finally {
      setIsLoadingHashtags(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, [activeNavItem]);
  
  useEffect(() => {
    fetchTrendingHashtags();
    
    if (isAuthenticated) {
      fetchSuggestedUsers();
      fetchActivity();
    }
  }, [isAuthenticated]);
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };
  
  const handlePostCreated = () => {
    fetchPosts();
  };
  
  const handleFollowUser = async (userId: string, isFollowing: boolean) => {
    if (!isAuthenticated) return;
    
    try {
      await usersAPI.followUser(userId);
      
      // Update the suggested users list
      setSuggestedUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, followers: isFollowing 
                ? [...(user.followers || []), user?._id || ''] 
                : (user.followers || []).filter(id => id !== user?._id) 
              } 
            : user
        )
      );
    } catch (err) {
      console.error('Failed to follow user:', 
        err instanceof Error ? err.message : String(err));
    }
  };
  
  const handleNavItemClick = (item: 'discover' | 'friends' | 'popular' | 'trending') => {
    setActiveNavItem(item);
  };
  
  const handleHashtagClick = (hashtag: string) => {
    // In a real app, you would navigate to the hashtag search results
    console.log(`Clicked on hashtag: ${hashtag}`);
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="rounded-xl overflow-hidden shadow-sm border mb-6" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <div className="p-4">
                  <h2 className="font-semibold mb-3" style={{ color: theme.colors.foreground }}>
                    Navigation
                  </h2>
                  
                  <nav className="space-y-1">
                    <NavigationItem
                      icon={<Compass size={20} />}
                      label="Discover"
                      isActive={activeNavItem === 'discover'}
                      onClick={() => handleNavItemClick('discover')}
                    />
                    
                    <NavigationItem
                      icon={<Users size={20} />}
                      label="Friends"
                      isActive={activeNavItem === 'friends'}
                      onClick={() => handleNavItemClick('friends')}
                    />
                    
                    <NavigationItem
                      icon={<Zap size={20} />}
                      label="Popular"
                      isActive={activeNavItem === 'popular'}
                      onClick={() => handleNavItemClick('popular')}
                    />
                    
                    <NavigationItem
                      icon={<TrendingUp size={20} />}
                      label="Trending"
                      isActive={activeNavItem === 'trending'}
                      onClick={() => handleNavItemClick('trending')}
                    />
                  </nav>
                </div>
              </div>
              
              {/* Trending Hashtags */}
              <div className="rounded-xl overflow-hidden shadow-sm border mb-6" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold" style={{ color: theme.colors.foreground }}>
                      Trending Topics
                    </h2>
                    <button 
                      onClick={() => setShowHashtagsModal(true)}
                      className="text-sm"
                      style={{ color: theme.colors.primary }}
                    >
                      See all
                    </button>
                  </div>
                  
                  <TrendingHashtags 
                    hashtags={trendingHashtags.slice(0, 5)} 
                    isLoading={isLoadingHashtags}
                    onHashtagClick={handleHashtagClick}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.foreground }}>
                {activeNavItem === 'discover' ? 'Discover' : 
                 activeNavItem === 'friends' ? 'Friends Feed' :
                 activeNavItem === 'popular' ? 'Popular Posts' : 'Trending Posts'}
              </h1>
              
              {isAuthenticated && activeNavItem === 'discover' && <CreatePostForm onPostCreated={handlePostCreated} />}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
                  <p className="text-sm" style={{ color: theme.colors.muted }}>Loading posts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 rounded-lg border" style={{ 
                  backgroundColor: `${theme.colors.error}10`, 
                  color: theme.colors.error,
                  borderColor: `${theme.colors.error}30`
                }}>
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={fetchPosts} 
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 rounded-lg border" style={{ 
                  backgroundColor: `${theme.colors.muted}10`, 
                  color: theme.colors.muted,
                  borderColor: theme.colors.border
                }}>
                  {activeNavItem === 'friends' ? (
                    <>
                      <p className="text-lg mb-2 font-medium">Your feed is empty</p>
                      <p>Follow some users to see their posts here, or check out the Discover tab</p>
                    </>
                  ) : (
                    <p className="text-lg">No posts available</p>
                  )}
                </div>
              ) : (
                <div>
                  {posts.map(post => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onUpdate={handlePostUpdate}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-20">
              {/* Suggested Users */}
              <div className="rounded-xl overflow-hidden shadow-sm border mb-6" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold" style={{ color: theme.colors.foreground }}>
                      Suggested for you
                    </h2>
                    <button 
                      onClick={() => setShowSuggestionsModal(true)}
                      className="text-sm"
                      style={{ color: theme.colors.primary }}
                    >
                      See all
                    </button>
                  </div>
                  
                  {isLoadingSuggestions ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
                    </div>
                  ) : suggestedUsers.length === 0 ? (
                    <div className="text-center py-4" style={{ color: theme.colors.muted }}>
                      <p>No suggestions available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestedUsers.slice(0, 3).map(user => (
                        <div key={user._id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar 
                              src={user.avatar} 
                              username={user.username} 
                              size="sm" 
                            />
                            <div className="ml-2">
                              <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
                                {user.username}
                              </p>
                              <p className="text-xs" style={{ color: theme.colors.muted }}>
                                {user.bio?.substring(0, 20)}...
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleFollowUser(user._id, true)}
                          >
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="rounded-xl overflow-hidden shadow-sm border" style={{ 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold" style={{ color: theme.colors.foreground }}>
                      Recent Activity
                    </h2>
                    <button 
                      onClick={() => setShowActivityModal(true)}
                      className="text-sm"
                      style={{ color: theme.colors.primary }}
                    >
                      See all
                    </button>
                  </div>
                  
                  <ActivityFeed 
                    activities={recentActivity.slice(0, 3)} 
                    isLoading={isLoadingActivity} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* See All Modals */}
      <SeeAllModal
        isOpen={showHashtagsModal}
        onClose={() => setShowHashtagsModal(false)}
        title="Trending Topics"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingHashtags ? (
            <div className="col-span-2 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
            </div>
          ) : trendingHashtags.length === 0 ? (
            <div className="col-span-2 text-center py-8" style={{ color: theme.colors.muted }}>
              <p>No trending topics available</p>
            </div>
          ) : (
            trendingHashtags.map((hashtag, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border flex items-center justify-between"
                style={{ 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${theme.colors.primary}15` }}
                  >
                    <TrendingUp size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.foreground }}>
                      {hashtag.tag}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.muted }}>
                      {hashtag.count} posts
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleHashtagClick(hashtag.tag)}
                >
                  View
                </Button>
              </div>
            ))
          )}
        </div>
      </SeeAllModal>
      
      <SeeAllModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        title="Suggested Users"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingSuggestions ? (
            <div className="col-span-2 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="col-span-2 text-center py-8" style={{ color: theme.colors.muted }}>
              <p>No suggestions available</p>
            </div>
          ) : (
            suggestedUsers.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                onFollow={handleFollowUser}
              />
            ))
          )}
        </div>
      </SeeAllModal>
      
      <SeeAllModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Recent Activity"
      >
        <div className="space-y-4">
          {isLoadingActivity ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8" style={{ color: theme.colors.muted }}>
              <p>No recent activity</p>
            </div>
          ) : (
            <ActivityFeed activities={recentActivity} />
          )}
        </div>
      </SeeAllModal>
    </Layout>
  );
};

export default HomePage;