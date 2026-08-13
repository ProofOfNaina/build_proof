'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { Bell } from 'lucide-react';

// There is no notifications backend yet. This page previously showed invented
// activity from fixed sample users, which read as real. It now says plainly that
// nothing is here rather than fabricating a feed.

export default function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-xl">
                  <Bell className="w-6 h-6 text-indigo-600" />
                  Notifications
                </h2>
              </div>

              <div className="px-6 py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Bell className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">No notifications</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Notifications aren’t built yet. When they are, you’ll see activity on
                  your posts and profile here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
