'use client';

import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Database, HardDrive, Link2, ShieldCheck, Wallet } from 'lucide-react';
import { shelbyNetwork } from '@/lib/shelbyClient';

/**
 * Explains what BuildProof actually does and shows the live state of the two
 * connections it depends on — the Aptos wallet and the Shelby storage network.
 *
 * This replaces the invented "trending topics" panel: the space is better spent
 * telling someone what the app is and whether their wallet is on the right
 * chain than showing numbers nobody produced.
 */
export const ConnectionPanel: React.FC = () => {
  const { account, connected, network } = useWallet();

  const shortAddress = account
    ? `${account.address.toString().slice(0, 6)}…${account.address.toString().slice(-4)}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 card-shadow">
      <h3 className="font-bold text-slate-900 mb-1">How BuildProof works</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Your profile and posts are yours. Files you attach are stored on{' '}
        <span className="font-semibold text-slate-700">Shelby</span>, a decentralized
        storage network, and every write is signed by your wallet — nobody can post or
        edit a profile as you.
      </p>

      <div className="space-y-3">
        <Row
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Wallet"
          value={connected && shortAddress ? shortAddress : 'Not connected'}
          ok={connected}
        />
        <Row
          icon={<Link2 className="w-3.5 h-3.5" />}
          label="Aptos network"
          value={network?.name ? `${network.name} · chain ${network.chainId}` : '—'}
          ok={!!network}
        />
        <Row
          icon={<HardDrive className="w-3.5 h-3.5" />}
          label="File storage"
          value={`Shelby · ${shelbyNetwork}`}
          ok
        />
        <Row
          icon={<Database className="w-3.5 h-3.5" />}
          label="Stored off-chain"
          value="Links only, never files"
          ok
        />
        <Row
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="Sign-in"
          value="Wallet signature"
          ok
        />
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed mt-4 pt-3 border-t border-slate-100">
        Uploads need a Petra wallet on {shelbyNetwork} with APT for gas and ShelbyUSD for
        storage. Each upload asks you to approve twice: once to register the file, once to
        confirm it is stored.
      </p>
    </div>
  );
};

function Row({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
          ok ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</p>
        <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
