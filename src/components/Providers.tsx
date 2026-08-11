'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { shelbyClient, shelbyNetwork } from '@/lib/shelbyClient';
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
          aptosApiKeys: {
            [shelbyNetwork]: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
          },
        }}
      >
        <ShelbyClientProvider client={shelbyClient}>
          {children}
        </ShelbyClientProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
