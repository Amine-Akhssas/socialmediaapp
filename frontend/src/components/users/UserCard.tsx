import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { usersAPI } from '../../lib/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface UserCardProps {
  user: User;
  onFollow?: (userId: string, isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollow }) => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.includes(user._id) || false
  );
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFollow = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await usersAPI.followUser(user._id);
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      
      if (onFollow) {
        onFollow(user._id, newIsFollowing);
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isCurrentUser = currentUser?._id === user._id;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden shadow-md p-4"
      style={{ 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }}
    >
      <div className="flex items-center justify-between">
        <Link to={`/profile/${user._id}`} className="flex items-center">
          <Avatar 
            src={user.avatar} 
            username={user.username} 
            size="md" 
          />
          <div className="ml-3">
            <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
              {user.username}
            </h3>
            {user.bio && (
              <p className="text-sm truncate max-w-[200px]" style={{ color: theme.colors.muted }}>
                {user.bio}
              </p>
            )}
          </div>
        </Link>
        
        {!isCurrentUser && isAuthenticated && (
          <Button
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            onClick={handleFollow}
            isLoading={isLoading}
            leftIcon={isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
      
      <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
            {user.followers?.length || 0}
          </p>
          <p className="text-xs" style={{ color: theme.colors.muted }}>Followers</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
            {user.following?.length || 0}
          </p>
          <p className="text-xs" style={{ color: theme.colors.muted }}>Following</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;