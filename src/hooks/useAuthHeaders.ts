'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useCallback, useEffect } from 'react';
import { clearSession, getAuthHeaders } from '@/lib/authClient';

/**
 * Returns a function that produces auth headers for the connected wallet,
 * prompting it to sign only when there is no live session.
 *
 * Call it inside the request that needs it, not at render time — it may await a
 * wallet prompt.
 */
export function useAuthHeaders() {
  const { account, connected, signMessage } = useWallet();

  // A disconnect (or an account switch) must not leave the previous wallet's
  // token cached for the next one.
  useEffect(() => {
    if (!connected) clearSession();
  }, [connected]);

  useEffect(() => {
    clearSession();
  }, [account?.address]);

  return useCallback(
    () => getAuthHeaders(account ?? null, signMessage),
    [account, signMessage],
  );
}
