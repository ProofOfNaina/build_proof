import React from 'react';
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react';
import { motion } from 'motion/react';

export const ChatUI: React.FC = () => {
  const conversations = [
    { name: 'Sarah Chen', lastMsg: 'The designs look great!', time: '2m', avatar: 'user2', active: true },
    { name: 'Marcus Thorne', lastMsg: 'Can we sync tomorrow?', time: '1h', avatar: 'user3', active: false },
    { name: 'Elena Gilbert', lastMsg: 'Sent you the PR link.', time: '3h', avatar: 'user4', active: false },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden card-shadow h-[calc(100vh-120px)] flex">
      {/* Left Panel */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search messages" 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat, i) => (
            <div 
              key={i} 
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${chat.active ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                <img 
                  src={`https://picsum.photos/seed/${chat.avatar}/100/100`} 
                  alt={chat.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {chat.active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img 
                src="https://picsum.photos/seed/user2/100/100" 
                alt="Sarah Chen" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sarah Chen</h3>
              <p className="text-[10px] text-emerald-500 font-medium">Online</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed">
                Hey Alex! Have you had a chance to look at the new BuildProof dashboard designs?
              </p>
              <span className="text-[10px] text-slate-400 mt-2 block">10:24 AM</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-indigo-100">
              <p className="text-sm leading-relaxed">
                Yes, Sarah! They look incredible. I love the new minimal approach to the feed.
              </p>
              <span className="text-[10px] text-indigo-200 mt-2 block">10:26 AM</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed">
                The designs look great! I&apos;ll start implementing the glassmorphism effects today.
              </p>
              <span className="text-[10px] text-slate-400 mt-2 block">10:28 AM</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
