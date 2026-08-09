'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { CreatePost } from '@/components/CreatePost';
import { PostCard } from '@/components/PostCard';
import { Landing } from '@/views/Landing';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function Home() {
  const { connected } = useWallet();
  const [showLanding, setShowLanding] = React.useState(true);

  const { data: posts, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axios.get('/api/posts');
      return response.data;
    },
  });

  if (showLanding && !connected) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            <div className="max-w-2xl mx-auto">
              <CreatePost onPostCreated={refetch} />
              <div className="space-y-4">
                {posts?.map((post: any) => (
                  <PostCard key={post.id} {...post} />
                ))}
                {posts?.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-medium">No posts yet. Be the first to build something!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SidebarRight />
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-bold text-slate-900">BuildProof</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a>
          </div>
          <p className="text-xs text-slate-400">© 2026 BuildProof Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
