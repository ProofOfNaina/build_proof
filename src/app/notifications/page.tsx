'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { Bell, UserPlus, Heart, MessageSquare, Briefcase, MoreHorizontal, Settings } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'connection',
      user: 'Sarah Chen',
      action: 'accepted your connection request',
      time: '2h ago',
      icon: <UserPlus className="w-4 h-4 text-indigo-600" />,
      avatar: 'user2'
    },
    {
      id: 2,
      type: 'like',
      user: 'Marcus Thorne',
      action: 'liked your post about Shelby Protocol',
      time: '4h ago',
      icon: <Heart className="w-4 h-4 text-rose-500" />,
      avatar: 'user3'
    },
    {
      id: 3,
      type: 'message',
      user: 'Elena Gilbert',
      action: 'sent you a new message',
      time: '6h ago',
      icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
      avatar: 'user4'
    },
    {
      id: 4,
      type: 'job',
      user: 'BuildProof Team',
      action: 'posted a new job: Senior Smart Contract Engineer',
      time: '1d ago',
      icon: <Briefcase className="w-4 h-4 text-amber-500" />,
      avatar: 'user1'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-xl">
                  <Bell className="w-6 h-6 text-indigo-600" />
                  Notifications
                </h2>
                <div className="flex items-center gap-4">
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Mark all as read
                  </button>
                  <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-6 hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                          <img 
                            src={`https://picsum.photos/seed/${notif.avatar}/100/100`} 
                            alt={notif.user} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-100">
                          {notif.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-900">{notif.user}</span> {notif.action}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium uppercase tracking-wider">{notif.time}</span>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-indigo-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50/50 text-center">
                <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all">
                  View older notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
