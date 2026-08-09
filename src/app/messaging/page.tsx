'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { MessageSquare, Search, Send, MoreHorizontal, Phone, Video } from 'lucide-react';

export default function MessagingPage() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [messageText, setMessageText] = React.useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', account?.address?.toString(), selectedUser?.wallet],
    queryFn: async () => {
      if (!account?.address || !selectedUser?.wallet) return [];
      const response = await axios.get(`/api/messages?user1=${account.address.toString()}&user2=${selectedUser.wallet}`);
      return response.data;
    },
    enabled: !!account?.address && !!selectedUser?.wallet,
    refetchInterval: 3000, // Poll for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!account?.address || !selectedUser?.wallet) return;
      await axios.post('/api/messages', {
        sender: account.address.toString(),
        receiver: selectedUser.wallet,
        text,
      });
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', account?.address?.toString(), selectedUser?.wallet] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8 h-[calc(100vh-160px)]">
          <SidebarLeft />

          <div className="flex-1 min-w-0 flex bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow">
            {/* Conversations List */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Messaging
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search messages"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {users?.filter((u: any) => u.wallet !== account?.address?.toString()).map((user: any) => (
                  <div 
                    key={user.wallet}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedUser?.wallet === user.wallet ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.wallet}`} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{user.name || 'Anonymous'}</h4>
                        <span className="text-[10px] text-slate-400">12:45 PM</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.bio || 'BuildProof User'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.wallet}`} 
                          alt={selectedUser.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{selectedUser.name || 'Anonymous'}</h3>
                        <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <Phone className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition-colors" />
                      <Video className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition-colors" />
                      <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages?.map((msg: any) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.sender === account?.address?.toString() ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === account?.address?.toString() ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                          {msg.text}
                          <div className={`text-[10px] mt-1 ${msg.sender === account?.address?.toString() ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!messages || messages.length === 0) && (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input 
                        type="text" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <button 
                        type="submit"
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                    <MessageSquare className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a conversation</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Choose a connection from the list to start messaging and building your professional network.
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
