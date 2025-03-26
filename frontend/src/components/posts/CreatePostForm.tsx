import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, X, Smile, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { postsAPI, usersAPI } from '../../lib/api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface CreatePostFormData {
  content: string;
}

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user: _user } = useAuthStore();
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
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreatePostFormData>();
  const content = watch('content', '');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload this to a server and get a URL back
    // For this demo, we'll use a fake URL
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setImage(null);
  };
  
  const onSubmit = async (data: CreatePostFormData) => {
    if (!data.content.trim() && !image) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await postsAPI.createPost(data.content, image || undefined);
      
      reset();
      setImage(null);
      setIsExpanded(false);
      onPostCreated();
    } catch (err: any) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden shadow-sm border mb-6"
      style={{ 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4">
          <div className="flex space-x-3">
            <Avatar 
              src={user?.avatar} 
              username={user?.username} 
              size="md" 
            />
            <div className="flex-1">
              <div 
                className={`w-full p-3 rounded-lg resize-none focus:outline-none transition-all cursor-text ${isExpanded ? 'min-h-[120px]' : 'min-h-[50px]'}`}
                style={{ 
                  backgroundColor: `${theme.colors.muted}10`,
                  color: theme.colors.foreground,
                  borderColor: errors.content ? theme.colors.error : 'transparent',
                }}
                onClick={() => setIsExpanded(true)}
              >
                {!isExpanded ? (
                  <div className="flex items-center h-full">
                    <p className="text-sm" style={{ color: theme.colors.muted }}>
                      What's on your mind, {user?.username?.split(' ')[0] || 'there'}?
                    </p>
                  </div>
                ) : (
                  <textarea
                    placeholder={`What's on your mind, ${user?.username?.split(' ')[0] || 'there'}?`}
                    className="w-full bg-transparent resize-none focus:outline-none min-h-[100px]"
                    style={{ 
                      color: theme.colors.foreground,
                    }}
                    {...register('content', {
                      validate: value => (!!value.trim() || !!image) || 'Post cannot be empty'
                    })}
                  />
                )}
              </div>
              
              {errors.content && (
                <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>
                  {errors.content.message}
                </p>
              )}
              
              {error && (
                <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>
                  {error}
                </p>
              )}
              
              <AnimatePresence>
                {image && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative mt-3 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt="Post preview" 
                      className="w-full h-auto max-h-60 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
                      style={{ backgroundColor: `${theme.colors.background}90` }}
                    >
                      <X size={16} style={{ color: theme.colors.foreground }} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mt-4 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                  <div className="flex flex-wrap items-center justify-between">
                    <p className="text-sm font-medium mb-2" style={{ color: theme.colors.foreground }}>
                      Add to your post
                    </p>
                    
                    <div className="flex space-x-1">
                      <label className="cursor-pointer p-2 rounded-full hover:bg-opacity-10 transition-colors" style={{ backgroundColor: `${theme.colors.muted}10` }}>
                        <Image size={20} style={{ color: theme.colors.primary }} />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </label>
                      
                      <button 
                        type="button"
                        className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                        style={{ backgroundColor: `${theme.colors.muted}10` }}
                      >
                        <Smile size={20} style={{ color: theme.colors.accent }} />
                      </button>
                      
                      <button 
                        type="button"
                        className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                        style={{ backgroundColor: `${theme.colors.muted}10` }}
                      >
                        <MapPin size={20} style={{ color: theme.colors.error }} />
                      </button>
                      
                      <button 
                        type="button"
                        className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                        style={{ backgroundColor: `${theme.colors.muted}10` }}
                      >
                        <Calendar size={20} style={{ color: theme.colors.secondary }} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: theme.colors.border }}>
          <Button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !image)}
            isLoading={isSubmitting}
            size={isExpanded ? "md" : "sm"}
            className="rounded-full px-6"
          >
            Post
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePostForm;