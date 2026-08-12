'use client';

import React from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { useShelbyFaucet } from '@/hooks/useShelbyFaucet';
import { shelbyNetwork } from '@/lib/shelbyClient';

/**
 * One-click funding for the connected wallet on a dev network.
 *
 * Uploads need both APT (gas) and ShelbyUSD (storage payment); an account
 * missing either fails partway through with an error that doesn't name the
 * cause. Renders nothing where no faucet exists.
 */
export const FundWallet: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { fund, isFunding, result, error, faucetAvailable } = useShelbyFaucet();

  if (!faucetAvailable) return null;

  return (
    <div className={className}>
      <button
        onClick={fund}
        disabled={isFunding}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-60"
      >
        {isFunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
        {isFunding ? 'Requesting tokens…' : `Get ${shelbyNetwork} test tokens`}
      </button>
      {result && <p className="mt-2 text-[11px] font-bold text-emerald-700">{result}</p>}
      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
};
