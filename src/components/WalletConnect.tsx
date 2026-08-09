'use client';

import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { connect, disconnect, connected, account, wallets } = useWallet();

  const handleConnect = async () => {
    try {
      // Find Petra wallet
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

  if (connected && account) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-bold text-sm shadow-sm hover:bg-indigo-100 transition-all"
      >
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="hidden sm:inline">
          {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
        </span>
        <span className="sm:hidden">Connected</span>
      </motion.button>
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
