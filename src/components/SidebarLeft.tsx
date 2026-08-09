'use client';

import React from 'react';
import { Bookmark, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export const SidebarLeft: React.FC = () => {
  const { account } = useWallet();
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${account?.address?.toString() || 'default'}`;

  return (
    <aside className="hidden md:flex flex-col gap-4 w-64 shrink-0">
      {/* Mini Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow">
        <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="px-4 pb-4 -mt-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-sm mb-3 bg-slate-100">
            {/* Plain <img>: these avatars are SVGs, which the Next image
                optimizer rejects unless `dangerouslyAllowSVG` is enabled. */}
            <img src={avatarUrl} alt="User Profile Avatar" width={64} height={64} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h3 className="font-bold text-slate-900 truncate w-full px-2">
            {account ? `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}` : 'Guest'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Professional @ BuildProof</p>
          
          <div className="w-full h-[1px] bg-slate-100 my-4" />
          
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Profile views</span>
              <span className="font-semibold text-indigo-600">1,240</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Post impressions</span>
              <span className="font-semibold text-indigo-600">8,432</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 card-shadow">
        <Link href="/profile">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer">
            <User className="w-4 h-4" />
            My Profile
          </div>
        </Link>
        <div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer">
          <Bookmark className="w-4 h-4" />
          Saved Posts
        </div>
        <div className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer">
          <Settings className="w-4 h-4" />
          Settings
        </div>
      </div>
    </aside>
  );
};
