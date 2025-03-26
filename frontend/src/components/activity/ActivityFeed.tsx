import React from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Activity } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import Avatar from '../ui/Avatar';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading = false }) => {
  const { theme } = useThemeStore();
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={16} style={{ color: theme.colors.accent }} />;
      case 'comment':
        return <MessageCircle size={16} style={{ color: theme.colors.primary }} />;
      case 'follow':
        return <UserPlus size={16} style={{ color: theme.colors.secondary }} />;
      case 'mention':
        return <AtSign size={16} style={{ color: theme.colors.warning }} />;
      case 'post':
        return <FileText size={16} style={{ color: theme.colors.foreground }} />;
      default:
        return null;
    }
  };
  
  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'like':
        return <span>liked your post</span>;
      case 'comment':
        return <span>commented on your post</span>;
      case 'follow':
        return <span>started following you</span>;
      case 'mention':
        return <span>mentioned you in a post</span>;
      case 'post':
        return <span>created a new post</span>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-4" style={{ color: theme.colors.muted }}>
        <p>No recent activity</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <motion.div 
          key={activity._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-2"
        >
          <Avatar 
            src={activity.author.avatar} 
            username={activity.author.username} 
            size="sm" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <div 
                className="flex items-center justify-center w-5 h-5 rounded-full mr-2"
                style={{ 
                  backgroundColor: activity.type === 'like' 
                    ? `${theme.colors.accent}15` 
                    : activity.type === 'comment'
                    ? `${theme.colors.primary}15`
                    : activity.type === 'follow'
                    ? `${theme.colors.secondary}15`
                    : activity.type === 'mention'
                    ? `${theme.colors.warning}15`
                    : `${theme.colors.foreground}15`
                }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <p className="text-sm" style={{ color: theme.colors.foreground }}>
                <span className="font-medium">{activity.author.username}</span>{' '}
                {getActivityText(activity)}
              </p>
            </div>
            {activity.post && (
              <div 
                className="mt-1 p-2 rounded-md text-sm truncate"
                style={{ backgroundColor: `${theme.colors.muted}10` }}
              >
                {activity.post.content}
              </div>
            )}
            <p className="text-xs mt-1" style={{ color: theme.colors.muted }}>
              {formatTime(activity.createdAt)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
