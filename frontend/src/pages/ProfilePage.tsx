import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Link as LinkIcon, Edit, UserPlus, UserCheck, Mail, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { User, Post, Follower } from '../types';
import Layout from '../components/layout/Layout';
import PostCard from '../components/posts/PostCard';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { postsAPI, usersAPI } from '../lib/api';

interface EditProfilePopupProps {
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
  theme: any;
}

const EditProfilePopup: React.FC<EditProfilePopupProps> = ({ onClose, user, onUpdate, theme }) => {
  const [name, setName] = useState(user.username);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Helper function to convert a File to a Base64 string
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let avatarBase64 = '';
    if (avatar) {
      try {
        avatarBase64 = await convertToBase64(avatar);
      } catch (err) {
        console.error('Error converting image to Base64:', err);
      }
    }

    try {
      // Build the payload as JSON
      const payload = {
        username: name,
        avatar: avatarBase64,
      };
      const updatedUser = await (await usersAPI.updateUser(user._id, payload)).data;
      onUpdate(updatedUser);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
          Update Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium" style={{ color: theme.colors.foreground }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border p-2"
              style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.card, color: theme.colors.foreground }}
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block font-medium" style={{ color: theme.colors.foreground }}>
              Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-1 block w-full"
              style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.card, color: theme.colors.foreground }}
            />
          </div>
          {avatarPreview && (
            <div className="mt-4">
              <p className="font-medium" style={{ color: theme.colors.foreground }}>
                Preview:
              </p>
              <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover" />
            </div>
          )}
          <div className="flex space-x-2">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<Follower[] | undefined>([]);
  const [following, setFollowing] = useState<Follower[] | undefined>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const fetchUserData = async () => {
    setError(null);
    try {
      setTimeout(async () => {
        const isSelfProfile = !userId || userId === currentUser?._id;
        const currentUserData = await (await usersAPI.getUser(currentUser!._id)).data
        const userProfile: User =
          isSelfProfile && currentUser
            ? currentUserData
            : await (await usersAPI.getUser(userId!)).data;

        setIsFollowing(currentUserData?.following?.includes(userProfile._id) || false);
        // set followers & following count
        setFollowersCount(userProfile?.followers?.length || 0);
        setFollowingCount(userProfile?.following?.length || 0);

        // get & set following & followers
        const userFollowing = await (await usersAPI.getUserFollowing(userProfile._id)).data
        const userFollowers = await (await usersAPI.getUserFollowers(userProfile._id)).data
        setFollowers(userFollowers)
        setFollowing(userFollowing)

        // Mock posts data (replace with an API call if needed)
        const mockPosts: Post[] = (await postsAPI.getUserPosts(userProfile._id)).data;

        setUser(userProfile);
        setPosts(mockPosts);
        setIsLoading(false);
      }, 0);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [userId, currentUser]);

  const isCurrentUser = currentUser?._id === user?._id;

  const handleFollow = async () => {
    if (!isAuthenticated) return;
    setIsFollowing(!isFollowing);
    setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    if (isFollowing) await usersAPI.unfollowUser(user?._id!)
    else await usersAPI.followUser(user?._id!)
    fetchUserData();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: theme.colors.primary }}
          ></div>
          <p className="text-sm" style={{ color: theme.colors.muted }}>
            Loading profile...
          </p>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div
          className="text-center py-20 rounded-xl border"
          style={{
            backgroundColor: `${theme.colors.error}10`,
            color: theme.colors.error,
            borderColor: `${theme.colors.error}30`,
          }}
        >
          <p className="text-xl mb-4">{error || 'User not found'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {showEditPopup && isCurrentUser && (
          <EditProfilePopup
            onClose={() => setShowEditPopup(false)}
            user={user}
            onUpdate={(updatedUser) => setUser(updatedUser)}
            theme={theme}
          />
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Profile Header */}
          <div
            className="rounded-xl overflow-hidden shadow-sm border mb-6"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }}
          >
            {/* Cover Photo */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {isCurrentUser && (
                <button
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                  style={{ color: 'white' }}
                  onClick={() => setShowEditPopup(true)}
                >
                  <Edit size={16} />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-6 border-4 rounded-full" style={{ borderColor: theme.colors.card }}>
                <Avatar src={user.avatar} username={user.username} size="xl" />
              </div>

              {/* Actions */}
              <div className="flex justify-end mb-12 space-x-2">
                {isCurrentUser ? (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit size={16} />}
                    onClick={() => setShowEditPopup(true)}
                  >
                    Edit Profile
                  </Button>
                ) : isAuthenticated && (
                  <>
                    <Button
                      variant={isFollowing ? 'outline' : 'primary'}
                      size="sm"
                      leftIcon={isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>

                    <Button variant="outline" size="sm" leftIcon={<MessageSquare size={16} />}>
                      Message
                    </Button>

                    <Button variant="outline" size="sm" leftIcon={<Mail size={16} />}>
                      Email
                    </Button>
                  </>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                  {user.username}
                </h1>

                {user.bio && (
                  <p className="mt-2" style={{ color: theme.colors.foreground }}>
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center" style={{ color: theme.colors.muted }}>
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="flex space-x-6 mt-6">
                  <div>
                    <span className="font-semibold" style={{ color: theme.colors.foreground }}>
                      {posts?.length}
                    </span>
                    <span className="ml-1" style={{ color: theme.colors.muted }}>
                      Posts
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: theme.colors.foreground }}>
                      {followersCount}
                    </span>
                    <span className="ml-1" style={{ color: theme.colors.muted }}>
                      Followers
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: theme.colors.foreground }}>
                      {followingCount}
                    </span>
                    <span className="ml-1" style={{ color: theme.colors.muted }}>
                      Following
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="border-b mb-6 rounded-t-xl overflow-hidden"
            style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.card }}
          >
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'posts' ? 'border-b-2' : ''}`}
                style={{
                  color: activeTab === 'posts' ? theme.colors.primary : theme.colors.muted,
                  borderColor: theme.colors.primary,
                }}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'followers' ? 'border-b-2' : ''}`}
                style={{
                  color: activeTab === 'followers' ? theme.colors.primary : theme.colors.muted,
                  borderColor: theme.colors.primary,
                }}
                onClick={() => setActiveTab('followers')}
              >
                Followers
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'following' ? 'border-b-2' : ''}`}
                style={{
                  color: activeTab === 'following' ? theme.colors.primary : theme.colors.muted,
                  borderColor: theme.colors.primary,
                }}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'posts' && (
            <div>
              {posts?.length === 0 ? (
                <div
                  className="text-center py-10 rounded-xl border"
                  style={{
                    backgroundColor: `${theme.colors.muted}10`,
                    color: theme.colors.muted,
                    borderColor: theme.colors.border,
                  }}
                >
                  <p className="text-lg mb-2 font-medium">No posts yet</p>
                  {isCurrentUser && <p className="mb-4">Share your first post with the world!</p>}
                </div>
              ) : (
                posts?.map((post) => <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />)
              )}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div>
              {followers?.length === 0 ? (
                <div
                  className="text-center py-10 rounded-xl border"
                  style={{
                    backgroundColor: `${theme.colors.muted}10`,
                    color: theme.colors.muted,
                    borderColor: theme.colors.border,
                  }}
                >
                  <p className="text-lg mb-2 font-medium">No followers yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followers?.map((follower, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={follower.avatar}
                          username={follower.username}
                          size="md"
                        />
                        <div className="ml-3">
                          <p className="font-medium" style={{ color: theme.colors.foreground }}>
                            {follower.username}
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.muted }}>
                            @{follower.username}
                          </p>
                        </div>
                      </div>
                      {currentUser?._id === follower._id ? '' : <Button variant="outline" size="sm">
                        Follow
                      </Button>}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div>
              {following?.length === 0 ? (
                <div
                  className="text-center py-10 rounded-xl border"
                  style={{
                    backgroundColor: `${theme.colors.muted}10`,
                    color: theme.colors.muted,
                    borderColor: theme.colors.border,
                  }}
                >
                  <p className="text-lg mb-2 font-medium">Not following anyone yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {following?.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={user.avatar}
                          username={user.username}
                          size="md"
                        />
                        <div className="ml-3">
                          <p className="font-medium" style={{ color: theme.colors.foreground }}>
                            {user.username}
                          </p>
                          <p className="text-sm" style={{ color: theme.colors.muted }}>
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <Button variant="primary" size="sm">
                        Following
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
