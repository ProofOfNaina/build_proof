'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Layers, MousePointer2, Wallet, HardDrive, Link2 as LinkIcon } from 'lucide-react';
import { shelbyNetwork } from '@/lib/shelbyClient';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 overflow-x-hidden">
      {/* Navbar for Landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3 border-white/20 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-bold text-slate-900 tracking-tight">BuildProof</span>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.5, 0.4]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[120px]" 
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 w-24 h-24 glass rounded-3xl flex items-center justify-center shadow-2xl opacity-40 hidden md:flex"
          >
            <Sparkles className="w-10 h-10 text-indigo-500" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -8, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-1/4 right-10 w-32 h-32 glass rounded-[2rem] flex items-center justify-center shadow-2xl opacity-40 hidden md:flex"
          >
            <Layers className="w-12 h-12 text-purple-500" />
          </motion.div>
          <motion.div
            animate={{ 
              x: [0, 15, 0],
              y: [0, 15, 0],
              rotate: [0, 12, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-[15%] w-16 h-16 glass rounded-2xl flex items-center justify-center shadow-2xl opacity-30 hidden lg:flex"
          >
            <MousePointer2 className="w-6 h-6 text-emerald-500" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="inline-block py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-8 border border-indigo-100/50 shadow-sm"
            >
              The Future of Professional Networking
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tight mb-10 leading-[1.05]">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                professional identity
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
              BuildProof is the modern platform for professionals to showcase their work, connect with peers, and find their next big opportunity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {connected ? (
                <motion.button 
                  onClick={onStart}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 group"
                >
                  Enter Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Connect your wallet to begin</p>
                  <WalletConnect />
                </div>
              )}
              <motion.button 
                onClick={onStart}
                whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all shadow-sm"
              >
                Browse the feed
              </motion.button>
            </div>
          </motion.div>

          {/* Mockup Preview with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
            className="mt-24 relative max-w-5xl mx-auto perspective-1000"
          >
            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] bg-white p-2">
              <div className="rounded-[2rem] overflow-hidden border border-slate-100">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="BuildProof Dashboard" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            {/* Floating Card Overlay */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-12 top-1/4 glass p-6 rounded-3xl shadow-2xl hidden lg:block border-white/40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full mb-1" />
                  <div className="h-2 w-12 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                <div className="h-1.5 w-2/3 bg-slate-50 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Wallet, color: 'text-indigo-600', title: 'Sign in with your wallet', desc: 'No passwords and no email. Connect a Petra wallet on Aptos, and every post and profile edit is signed by you — so nobody can act as you.' },
              { icon: ShieldCheck, color: 'text-purple-600', title: 'Files stored on Shelby', desc: 'Images and PDFs you attach go to Shelby, a decentralized storage network. Your files are not sitting in an app database — only a link to them is.' },
              { icon: Globe, color: 'text-emerald-600', title: 'A profile you own', desc: 'Your résumé, links and work are tied to your wallet address rather than an account we control, and you can verify every file on the Shelby explorer.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="space-y-6 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
              >
                <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — the same explanation the app shows in the sidebar, so a
          visitor understands the wallet and storage model before connecting. */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-5 border border-indigo-100/50">
              How BuildProof works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
              Your identity, not an account
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              BuildProof has no signup form and no password. You are identified by your
              Aptos wallet, and the files you share are stored on Shelby rather than in
              our database.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Wallet,
                title: 'Connect a Petra wallet',
                desc: `Your wallet address is your account. Point Petra at ${shelbyNetwork} — the network BuildProof stores files on — and connect. Nothing to remember, nothing to reset.`,
              },
              {
                icon: ShieldCheck,
                title: 'Every write is signed by you',
                desc: 'Posting, editing your profile or sending a message asks your wallet for a signature. The server verifies it before writing, so no one can post or edit a profile as you.',
              },
              {
                icon: HardDrive,
                title: 'Files go to Shelby, not to us',
                desc: 'Attach an image or PDF and it is erasure-coded in your browser, registered on-chain, then stored across Shelby’s storage providers. Your wallet approves twice: once to register the file, once to confirm it is stored.',
              },
              {
                icon: LinkIcon,
                title: 'We keep the link, never the file',
                desc: 'Only a reference is saved — the Shelby explorer link and the URL used to display it. You can verify any file on the Shelby explorer, and deleting a post never destroys what is stored.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-5 p-6 md:p-7 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-slate-300 w-6 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-3xl border border-amber-200 bg-amber-50">
            <h4 className="text-sm font-bold text-amber-900 mb-2">Before your first upload</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Uploads are real on-chain transactions, so the connected wallet needs{' '}
              <strong>APT</strong> for gas and <strong>ShelbyUSD</strong> to pay for storage
              on {shelbyNetwork}. Your profile page has a button that requests both from the
              faucet. Browsing, posting text and messaging need neither.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};