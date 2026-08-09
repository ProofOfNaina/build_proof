import React from 'react';
import { Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export const SidebarRight: React.FC = () => {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
  });

  const trending = [
    { topic: '#FutureOfWork', posts: '12.4k' },
    { topic: '#AIGeneration', posts: '8.2k' },
    { topic: '#RemoteCulture', posts: '5.1k' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
      {/* Suggestions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 card-shadow">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
          Add to your feed
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </h3>
        <div className="space-y-4">
          {users?.slice(0, 3).map((user: any, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.wallet}`} alt={user.name || "User Profile"} width={40} height={40} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{user.name || 'Anonymous'}</h4>
                <p className="text-[10px] text-slate-500 truncate">{user.bio || 'BuildProof User'}</p>
                <Link href={`/profile?wallet=${user.wallet}`}>
                  <button className="mt-2 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    <Plus className="w-3 h-3" />
                    Connect
                  </button>
                </Link>
              </div>
            </div>
          ))}
          {!users || users.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No suggestions yet</p>
          )}
        </div>
        <Link href="/network">
          <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 group transition-all">
            View all suggestions
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 card-shadow">
        <h3 className="font-bold text-slate-900 mb-4">Trending now</h3>
        <div className="space-y-4">
          {trending.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.topic}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.posts} posts today</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
