'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { clearSession } from '@/lib/authClient';
import { shelbyNetwork } from '@/lib/shelbyClient';

export const SidebarLeft: React.FC = () => {
  const { account, connected, network, disconnect } = useWallet();
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${account?.address?.toString() || 'default'}`;

  const handleLogout = () => {
    // Drop the cached bearer token as well as the wallet connection, so the next
    // sign-in re-signs rather than reusing this wallet's session.
    clearSession();
    disconnect();
  };

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
          <p className="text-xs text-slate-500 mt-1">
            {connected ? 'Wallet connected' : 'Not connected'}
          </p>

          <div className="w-full h-[1px] bg-slate-100 my-4" />

          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs gap-2">
              <span className="text-slate-500 shrink-0">Network</span>
              <span className="font-semibold text-slate-700 truncate">
                {network?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between text-xs gap-2">
              <span className="text-slate-500 shrink-0">Storage</span>
              <span className="font-semibold text-slate-700 truncate">{shelbyNetwork}</span>
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
        {connected && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        )}
      </div>
    </aside>
  );
};
