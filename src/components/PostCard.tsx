import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface PostCardProps {
  id: string;
  author: string; // walletAddress
  content: string;
  mediaUrl?: string;
  explorerUrl?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  author, 
  content, 
  mediaUrl, 
  explorerUrl,
  createdAt, 
  likes = 0, 
  comments = 0 
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        rotateX: 1,
        rotateY: -1,
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow mb-4 card-3d"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-slate-100"
            >
              <img 
                src={avatarUrl} 
                alt={author} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors">
                {author.slice(0, 6)}...{author.slice(-4)}
              </h4>
              <p className="text-[10px] text-slate-500">Professional • {formattedDate}</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
          {content}
        </p>

        {/* Media */}
        {mediaUrl && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="rounded-xl overflow-hidden mb-4 border border-slate-100 shadow-sm"
          >
            {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video 
                src={mediaUrl} 
                controls 
                className="w-full h-auto max-h-[400px] object-cover"
              />
            ) : (
              <img 
                src={mediaUrl} 
                alt="Post media" 
                className="w-full h-auto object-cover max-h-[400px]"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors group"
            >
              <Heart className="w-5 h-5 group-hover:fill-rose-500 transition-all" />
              <span className="text-xs font-bold">{likes}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-bold">{comments}</span>
            </motion.button>
          </div>
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-bold">Share</span>
            </motion.button>
            
            {explorerUrl && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                onClick={() => window.open(explorerUrl, '_blank')}
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-xs font-bold">Shelby Explorer</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
