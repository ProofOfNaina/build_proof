'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { NetworkToFaucetAPI } from '@aptos-labs/ts-sdk';
import { useCallback, useState } from 'react';
import { shelbyNetwork } from '@/lib/shelbyClient';

/**
 * An upload needs two balances, per the Shelby CLI docs:
 *   1. APT       — gas for the on-chain blob registration
 *   2. ShelbyUSD — payment for the storage operation itself
 * Without both, the upload fails at the register or the PUT step.
 */
const APT_AMOUNT = 100_000_000; // 1 APT (8 decimals)
const SHELBY_USD_AMOUNT = 100_000_000;

const faucetBaseUrl: string | undefined = (NetworkToFaucetAPI as Record<string, string | undefined>)[
  shelbyNetwork
];

export const faucetAvailable = !!faucetBaseUrl;

/**
 * Both assets come from the same faucet, which takes `{ address, amount }` as
 * JSON and answers `{ txn_hashes: [...] }`; ShelbyUSD is selected with
 * `?asset=shelbyusd`.
 *
 * These are called directly rather than through the SDK's
 * `fundAccountWithAPT()`, whose underlying `aptos.fundAccount()` throws
 * "The `url` option is not supported in options objects" against this faucet.
 */
async function requestFunds(baseUrl: string, address: string, amount: number, asset?: string) {
  const url = asset ? `${baseUrl}/fund?asset=${asset}` : `${baseUrl}/fund`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, amount }),
  });
  if (!response.ok) {
    throw new Error((await response.text()).slice(0, 200) || `HTTP ${response.status}`);
  }
  return response.json();
}

export function useShelbyFaucet() {
  const { account } = useWallet();
  const [isFunding, setIsFunding] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fund = useCallback(async () => {
    if (!account) {
      setError('Connect your wallet first.');
      return;
    }
    if (!faucetBaseUrl) {
      setError(`No faucet is available on ${shelbyNetwork}.`);
      return;
    }

    setIsFunding(true);
    setError(null);
    setResult(null);

    const address = account.address.toString();
    const funded: string[] = [];
    const failed: string[] = [];

    // Requested independently: one faucet being dry or rate-limited shouldn't
    // stop the other, and partial funding is still progress worth reporting.
    await Promise.all([
      requestFunds(faucetBaseUrl, address, APT_AMOUNT)
        .then(() => funded.push('APT'))
        .catch((e: any) => failed.push(`APT (${e?.message ?? 'failed'})`)),
      requestFunds(faucetBaseUrl, address, SHELBY_USD_AMOUNT, 'shelbyusd')
        .then(() => funded.push('ShelbyUSD'))
        .catch((e: any) => failed.push(`ShelbyUSD (${e?.message ?? 'failed'})`)),
    ]);

    setIsFunding(false);
    if (funded.length) setResult(`Funded: ${funded.join(' + ')}`);
    if (failed.length) setError(`Could not fund ${failed.join(', ')}`);
  }, [account]);

  return { fund, isFunding, result, error, faucetAvailable };
}
