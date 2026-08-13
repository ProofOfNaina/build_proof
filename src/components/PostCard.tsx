'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ExternalLink, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

interface PostCardProps {
  id: string;
  author: string; // walletAddress
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf';
  mediaName?: string;
  explorerUrl?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  author,
  content,
  mediaUrl,
  mediaType,
  mediaName,
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

  const { data: authorUser } = useQuery({
    queryKey: ['user', author],
    queryFn: async () => {
      if (!author) return null;
      try {
        const response = await axios.get(`/api/users/${author}`);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!author,
  });

  const avatarUrl = authorUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;
  const authorDisplayName = authorUser?.name || `${author.slice(0, 6)}...${author.slice(-4)}`;

  const isPdf = mediaType === 'pdf' || (!mediaType && /\.pdf$/i.test(mediaUrl ?? ''));
  const isVideo = !mediaType && /\.(mp4|webm|ogg)$/i.test(mediaUrl ?? '');

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
          <Link href={`/profile?wallet=${encodeURIComponent(author)}`} className="flex items-center gap-3 group/author">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-slate-100"
            >
              <img 
                src={avatarUrl} 
                alt={authorDisplayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;
                }}
              />
            </motion.div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover/author:text-indigo-600 cursor-pointer transition-colors">
                {authorDisplayName}
              </h4>
              <p className="text-[10px] text-slate-500">Professional • {formattedDate}</p>
            </div>
          </Link>
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
        {mediaUrl && (isPdf ? (
          <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200 bg-slate-50 card-shadow">
            <div className="flex items-center justify-between p-3.5 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {mediaName || 'Document.pdf'}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF • On-chain stored on Shelby</p>
                </div>
              </div>
            </div>
            <div className="w-full h-80 bg-slate-100">
              <iframe
                src={`${mediaUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title={mediaName || 'PDF Document'}
              />
            </div>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-sm bg-slate-900/5 max-h-[520px] flex items-center justify-center"
          >
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                className="w-full h-auto max-h-[500px] object-cover"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={mediaName || 'Post media'}
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.warn('Post image failed to load:', mediaUrl);
                }}
              />
            )}
          </motion.div>
        ))}

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