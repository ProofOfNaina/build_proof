'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { shelbyApiKey, shelbyClient, shelbyNetwork } from '@/lib/shelbyClient';
import dynamic from 'next/dynamic';

const ShelbyClientProvider = dynamic(
  () => import('@shelby-protocol/react').then((mod) => mod.ShelbyClientProvider),
  { ssr: false }
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider 
        autoConnect={true}
        dappConfig={{
          // Must match the Shelby network: registering blob commitments is an
          // on-chain transaction on that same chain, so a wallet pointed at a
          // different network cannot sign it.
          network: shelbyNetwork,
          // Only sent when the key is declared for this network. A mismatched
          // key makes the node reject requests it would otherwise serve openly.
          ...(shelbyApiKey ? { aptosApiKeys: { [shelbyNetwork]: shelbyApiKey } } : {}),
        }}
      >
        <ShelbyClientProvider client={shelbyClient}>
          {children}
        </ShelbyClientProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
