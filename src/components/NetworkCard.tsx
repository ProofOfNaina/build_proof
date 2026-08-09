'use client';

import React from 'react';
import { UserPlus, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

interface NetworkCardProps {
  name?: string;
  bio?: string;
  location?: string;
  wallet: string;
  avatarUrl?: string;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ name, bio, location, wallet, avatarUrl }) => {
  const avatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${wallet}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        y: -8,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow flex flex-col items-center text-center p-6 hover:border-indigo-200 transition-all group card-3d"
    >
      <Link href={`/profile?wallet=${encodeURIComponent(wallet)}`} className="w-full flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border-4 border-slate-50 shadow-md bg-slate-100"
        >
          <img src={avatar} alt={name ? name : "User Profile"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </motion.div>
        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate w-full">
          {name || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
        </h3>
        <p className="text-xs text-slate-500 mt-1 h-8 line-clamp-2">{bio || 'BuildProof Professional'}</p>
        
        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-3">
          <MapPin className="w-3 h-3" />
          {location || 'Remote'}
        </div>
      </Link>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="mt-6 w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
      >
        <UserPlus className="w-4 h-4" />
        Connect
      </motion.button>
    </motion.div>
  );
};
