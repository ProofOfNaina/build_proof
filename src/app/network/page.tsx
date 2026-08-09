'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { NetworkCard } from '@/components/NetworkCard';
import { Users, UserPlus, Search } from 'lucide-react';

export default function NetworkPage() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            {/* Network Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-indigo-600" />
                  My Network
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {users?.length || 0} Connections
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, role, or company"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Network Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  People you may know
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users?.map((user: any) => (
                  <NetworkCard key={user.wallet} {...user} />
                ))}
              </div>

              {(!users || users.length === 0) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">No connections found</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Start building your network by connecting with other professionals on BuildProof.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
