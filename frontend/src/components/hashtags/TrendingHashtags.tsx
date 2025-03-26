import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';

interface TrendingHashtagsProps {
  hashtags: string[];
  isLoading?: boolean;
  onHashtagClick?: (tag: string) => void;
}

const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ 
  hashtags, 
  isLoading = false,
  onHashtagClick
}) => {
  const { theme } = useThemeStore();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!hashtags || hashtags.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No trending hashtags</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {hashtags.map((hashtag, index) => (
        <motion.div
          key={hashtag}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between group cursor-pointer"
          onClick={() => onHashtagClick && onHashtagClick(hashtag)}
        >
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform bg-opacity-15"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Hash size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-medium group-hover:text-primary transition-colors text-foreground">
                {hashtag}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-primary">
            <TrendingUp size={14} className="mr-1" />
            <span>Trending</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingHashtags;