'use client';

import React from 'react';
import { Search, Home, Users, Briefcase, MessageSquare, Bell, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { account } = useWallet();

  const navItems = [
    { id: '/', icon: Home, label: 'Home' },
    { id: '/network', icon: Users, label: 'Network' },
    { id: '/jobs', icon: Briefcase, label: 'Jobs' },
    { id: '/messaging', icon: MessageSquare, label: 'Messaging' },
    { id: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass h-16 flex items-center px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-all">
              B
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">BuildProof</span>
          </motion.div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search professionals, jobs..." 
            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2 pl-10 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 transition-all outline-none"
          />
        </div>

        {/* Nav Icons */}
        <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
          {navItems.map((item) => (
            <Link key={item.id} href={item.id}>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center gap-1 group relative cursor-pointer ${
                  isActive(item.id) ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'
                } transition-colors`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.id) ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span className="text-[10px] font-bold hidden lg:block">{item.label}</span>
                {isActive(item.id) && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)]" 
                  />
                )}
              </motion.div>
            </Link>
          ))}
          
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          <Link href="/profile">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 group cursor-pointer ${isActive('/profile') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all shadow-sm bg-slate-100">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${account?.address || 'default'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] font-bold hidden lg:block">Me</span>
            </motion.div>
          </Link>

          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          
          <button className="md:hidden text-slate-500">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};