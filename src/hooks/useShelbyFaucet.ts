'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { useCallback, useState } from 'react';
import { shelbyClient, shelbyNetwork } from '@/lib/shelbyClient';

/**
 * An upload needs two balances, per the Shelby CLI docs:
 *   1. APT      — gas for the on-chain blob registration
 *   2. ShelbyUSD — payment for the storage operation itself
 * Without both, the upload fails at the register or the PUT step.
 */
const APT_AMOUNT = 100_000_000; // 1 APT (8 decimals)
const SHELBY_USD_AMOUNT = 100_000_000;

/** Faucets only exist on the dev networks. */
export const faucetAvailable = shelbyNetwork === Network.SHELBYNET || shelbyNetwork === Network.LOCAL;

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
    if (!faucetAvailable) {
      setError(`No faucet is available on ${shelbyNetwork}.`);
      return;
    }

    setIsFunding(true);
    setError(null);
    setResult(null);

    const address = account.address.toString();
    const outcomes: string[] = [];
    const failures: string[] = [];

    // Requested independently: one faucet being dry or rate-limited shouldn't
    // stop the other, and partial funding is still progress worth reporting.
    await Promise.all([
      shelbyClient
        .fundAccountWithAPT({ address, amount: APT_AMOUNT })
        .then(() => outcomes.push('APT'))
        .catch((e: any) => failures.push(`APT (${e?.message ?? 'failed'})`)),
      shelbyClient
        .fundAccountWithShelbyUSD({ address, amount: SHELBY_USD_AMOUNT })
        .then(() => outcomes.push('ShelbyUSD'))
        .catch((e: any) => failures.push(`ShelbyUSD (${e?.message ?? 'failed'})`)),
    ]);

    setIsFunding(false);
    if (outcomes.length) setResult(`Funded: ${outcomes.join(' + ')}`);
    if (failures.length) setError(`Could not fund ${failures.join(', ')}`);
  }, [account]);

  return { fund, isFunding, result, error, faucetAvailable };
}
