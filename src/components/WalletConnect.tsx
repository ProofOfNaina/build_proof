'use client';

import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion } from 'motion/react';
import { Copy, Check, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { clearSession } from '@/lib/authClient';

export const WalletConnect: React.FC = () => {
  const { connect, disconnect, connected, account, network, wallets } = useWallet();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click / Escape, so the menu doesn't strand the user.
  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleConnect = async () => {
    try {
      const petra = wallets?.find((w) => w.name === 'Petra');
      if (petra) {
        await connect(petra.name);
      } else {
        alert('Petra wallet not found. Please install it.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleLogout = () => {
    // Drop the cached bearer token as well as the wallet connection, so the next
    // sign-in re-signs rather than reusing this wallet's session.
    clearSession();
    disconnect();
    setOpen(false);
  };

  const copyAddress = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked by permissions; the address is on screen anyway.
    }
  };

  if (connected && account) {
    const address = account.address.toString();
    return (
      <div className="relative" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-bold text-sm shadow-sm hover:bg-indigo-100 transition-all"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="hidden sm:inline">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className="sm:hidden">Connected</span>
        </motion.button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50"
          >
            <div className="px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                Connected wallet
              </p>
              <p className="text-xs font-mono text-slate-700 break-all mt-1">{address}</p>
              {network?.name && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {network.name} · chain {network.chainId}
                </p>
              )}
            </div>

            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy address'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
    >
      <WalletIcon className="w-4 h-4" />
      <span>Connect Wallet</span>
    </motion.button>
  );
};
