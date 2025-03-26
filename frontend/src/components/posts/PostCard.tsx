import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { postsAPI } from '../../lib/api';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';

interface PostCardProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ''));
  const [isSaved, setIsSaved] = useState(post.saved || false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares || 0);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    try {
      await postsAPI.likePost(post._id);
      
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
      if (onUpdate && user) {
        const updatedPost = {
          ...post,
          likes: newIsLiked 
            ? [...post.likes, user._id]
            : post.likes.filter(id => id !== user._id)
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    try {
      await postsAPI.savePost(post._id);
      
      setIsSaved(!isSaved);
      
      if (onUpdate) {
        const updatedPost = {
          ...post,
          saved: !isSaved
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsSharing(true);
      
      await postsAPI.sharePost(post._id);
      
      setShareCount(prev => prev + 1);
      
      if (onUpdate) {
        const updatedPost = {
          ...post,
          shares: (post.shares || 0) + 1
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !isAuthenticated || !user) return;
    
    setIsSubmitting(true);
    try {
      const response = await postsAPI.addComment(post._id, commentText);
      
      if (onUpdate && user) {
        const updatedPost = {
          ...post,
          comments: [...post.comments, response.data]
        };
        onUpdate(updatedPost);
      }
      
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Truncate long content
  const MAX_LENGTH = 280;
  const isContentLong = post.content.length > MAX_LENGTH;
  const displayContent = isExpanded || !isContentLong 
    ? post.content 
    : `${post.content.substring(0, MAX_LENGTH)}...`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden shadow-sm border mb-6"
      style={{ 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center group">
          <div className="relative">
            <Avatar 
              src={post.author?.avatar} 
              username={post.author?.username} 
              size="md" 
              className="group-hover:ring-2 transition-all"
              style={{ ringColor: theme.colors.primary }}
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold group-hover:text-primary transition-colors" style={{ color: theme.colors.foreground }}>
              {post.author?.username}
            </h3>
            <p className="text-xs" style={{ color: theme.colors.muted }}>
              {formatDate(post.createdAt)}
            </p>
          </div>
        </Link>
        <button 
          className="p-1.5 rounded-full hover:bg-opacity-10 transition-colors"
          style={{ backgroundColor: `${theme.colors.muted}10` }}
        >
          <MoreHorizontal size={18} style={{ color: theme.colors.muted }} />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3" style={{ color: theme.colors.foreground }}>
        <p className="whitespace-pre-line">{displayContent}</p>
        
        {isContentLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm font-medium"
            style={{ color: theme.colors.primary }}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      {/* Post Image (if any) */}
      {post.image && (
        <div className="w-full mt-2">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 flex items-center justify-between border-t" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center space-x-2" style={{ color: theme.colors.muted }}>
          <div className="flex items-center">
            <div 
              className="flex items-center justify-center w-5 h-5 rounded-full mr-1"
              style={{ backgroundColor: `${theme.colors.accent}15` }}
            >
              <Heart size={12} style={{ color: theme.colors.accent }} fill={theme.colors.accent} />
            </div>
            <span className="text-sm">{likesCount}</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <div 
              className="flex items-center justify-center w-5 h-5 rounded-full mr-1"
              style={{ backgroundColor: `${theme.colors.primary}15` }}
            >
              <MessageCircle size={12} style={{ color: theme.colors.primary }} />
            </div>
            <span className="text-sm">{post?.comments?.length}</span>
          </div>
          {shareCount > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center">
                <div 
                  className="flex items-center justify-center w-5 h-5 rounded-full mr-1"
                  style={{ backgroundColor: `${theme.colors.secondary}15` }}
                >
                  <Share2 size={12} style={{ color: theme.colors.secondary }} />
                </div>
                <span className="text-sm">{shareCount}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: `${theme.colors.muted}10` }}
          >
            {isSaved ? (
              <BookmarkCheck size={16} style={{ color: theme.colors.primary }} fill={theme.colors.primary} />
            ) : (
              <Bookmark size={16} style={{ color: theme.colors.muted }} />
            )}
          </button>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 flex items-center justify-between border-t" style={{ borderColor: theme.colors.border }}>
        <button 
          onClick={handleLike}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md hover:bg-opacity-10 transition-colors"
          style={{ 
            color: isLiked ? theme.colors.accent : theme.colors.muted,
            backgroundColor: isLiked ? `${theme.colors.accent}10` : 'transparent',
            ':hover': { backgroundColor: `${theme.colors.muted}10` }
          }}
        >
          <Heart size={18} fill={isLiked ? theme.colors.accent : 'none'} />
          <span className="text-sm font-medium">Like</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md hover:bg-opacity-10 transition-colors"
          style={{ 
            color: showComments ? theme.colors.primary : theme.colors.muted,
            backgroundColor: showComments ? `${theme.colors.primary}10` : 'transparent',
            ':hover': { backgroundColor: `${theme.colors.muted}10` }
          }}
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Comment</span>
        </button>
        
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md hover:bg-opacity-10 transition-colors"
          style={{ 
            color: theme.colors.muted,
            backgroundColor: 'transparent',
            ':hover': { backgroundColor: `${theme.colors.muted}10` }
          }}
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">
            {isSharing ? 'Sharing...' : 'Share'}
          </span>
        </button>
      </div>
      
      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 border-t"
            style={{ borderColor: theme.colors.border }}
          >
            {/* Comment Input */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2 mb-4">
                <Avatar 
                  src={user?.avatar} 
                  username={user?.username} 
                  size="sm" 
                />
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    fullWidth
                    rightIcon={
                      <button 
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-colors"
                      >
                        <Send 
                          size={18} 
                          style={{ 
                            color: commentText.trim() 
                              ? theme.colors.primary 
                              : theme.colors.muted 
                          }} 
                        />
                      </button>
                    }
                  />
                </div>
              </div>
            )}
            
            {/* Comments List */}
            <div className="space-y-3">
              {post?.comments?.length > 0 ? (
                post?.comments.map((comment) => (
                  <motion.div 
                    key={comment._id} 
                    className="flex space-x-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar 
                      src={comment.author.avatar} 
                      username={comment.author.username} 
                      size="sm" 
                    />
                    <div className="flex-1">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm" style={{ color: theme.colors.foreground }}>
                            {comment.author.username}
                          </h4>
                          <span className="text-xs" style={{ color: theme.colors.muted }}>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: theme.colors.foreground }}>
                          {comment.text}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 ml-2 space-x-3">
                        <button className="text-xs font-medium" style={{ color: theme.colors.muted }}>
                          Like
                        </button>
                        <button className="text-xs font-medium" style={{ color: theme.colors.muted }}>
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm mb-2" style={{ color: theme.colors.muted }}>
                    No comments yet
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.muted }}>
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;