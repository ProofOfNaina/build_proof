'use client';

// Client half of the wallet-signature auth in `@/lib/auth`.
//
// Signs one payload with the connected wallet, trades it for a bearer token at
// /api/session, and caches that token in memory for the rest of its lifetime.
// Concurrent callers share a single in-flight sign-in so the wallet only ever
// prompts once.

import axios from 'axios';
import type { AccountInfo } from '@aptos-labs/wallet-standard';
import { AUTH_DOMAIN, type SessionPayload } from './auth';

export type SignMessage = (input: { message: string; nonce: string }) => Promise<{
  fullMessage: string;
  signature: { toString(): string };
  nonce: string;
}>;

interface CachedSession {
  wallet: string;
  token: string;
  expiresAt: number;
}

let cached: CachedSession | null = null;
let inFlight: Promise<CachedSession> | null = null;

/** Refresh slightly early so a token can't expire mid-request. */
const REFRESH_MARGIN_MS = 30 * 1000;

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function isUsable(session: CachedSession | null, wallet: string): session is CachedSession {
  return (
    session !== null &&
    session.wallet === wallet &&
    session.expiresAt - REFRESH_MARGIN_MS > Date.now()
  );
}

async function createSession(
  account: AccountInfo,
  signMessage: SignMessage,
): Promise<CachedSession> {
  const wallet = account.address.toString();
  const payload: SessionPayload = { domain: AUTH_DOMAIN, wallet, timestamp: Date.now() };
  // Must stay newline-free: the wallet embeds it verbatim in a line-delimited
  // `fullMessage`, and the server checks the payload round-trips out of it.
  const message = JSON.stringify(payload);
  const nonce = randomNonce();

  const signed = await signMessage({ message, nonce });

  const { data } = await axios.post('/api/session', {
    wallet,
    publicKey: account.publicKey.toString(),
    signature: signed.signature.toString(),
    message,
    fullMessage: signed.fullMessage,
    nonce: signed.nonce ?? nonce,
  });

  return { wallet, token: data.token, expiresAt: data.expiresAt };
}

/**
 * Returns headers authenticating the connected wallet, prompting it to sign
 * only when there is no usable cached session.
 *
 * Throws if no wallet is connected — callers should gate on `connected` first.
 */
export async function getAuthHeaders(
  account: AccountInfo | null,
  signMessage: SignMessage,
): Promise<Record<string, string>> {
  if (!account) {
    throw new Error('Wallet not connected');
  }
  const wallet = account.address.toString();

  if (isUsable(cached, wallet)) {
    return { Authorization: `Bearer ${cached.token}` };
  }

  // Collapse parallel callers (e.g. a poll and a send firing together) onto one
  // wallet prompt.
  inFlight ??= createSession(account, signMessage)
    .then((session) => {
      cached = session;
      return session;
    })
    .finally(() => {
      inFlight = null;
    });

  const session = await inFlight;
  return { Authorization: `Bearer ${session.token}` };
}

/** Drops the cached session, e.g. after a 401 or on wallet disconnect. */
export function clearSession() {
  cached = null;
}
