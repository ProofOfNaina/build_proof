// Wallet-signature authentication for the BuildProof API.
//
// Every write (and any read of private data) must carry proof that the caller
// controls the wallet it claims to be.
//
// Flow: the client signs one short JSON payload with its Aptos wallet and posts
// it to /api/session, which verifies the signature and returns an opaque bearer
// token. Subsequent requests carry that token. Signing per request would be more
// literal, but the messaging view polls every few seconds and a wallet prompt on
// every poll is unusable — so the signature establishes a session instead.
//
// Only Ed25519 keys are supported, which covers Petra and the other standard
// single-key Aptos wallets. Multi-key / keyless accounts are rejected with an
// explicit error rather than silently passing.

import { randomBytes, createHash } from 'crypto';
import { AccountAddress, Ed25519PublicKey, Ed25519Signature } from '@aptos-labs/ts-sdk';

/** Namespaces the signed payload so a signature can't be reused on another app. */
export const AUTH_DOMAIN = 'buildproof.session';

/** How long a signature stays valid. Long enough to cover a slow wallet prompt. */
const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

/** How long an issued session token lasts before the wallet must sign again. */
export const SESSION_TTL_MS = 30 * 60 * 1000;

/** The JSON object the wallet actually signs. */
export interface SessionPayload {
  domain: typeof AUTH_DOMAIN;
  wallet: string;
  timestamp: number;
}

/** What the client posts to /api/session. */
export interface SignedSession {
  wallet: string;
  publicKey: string;
  signature: string;
  /** The `message` argument handed to the wallet — a JSON-encoded SessionPayload. */
  message: string;
  /** The prefixed message the wallet actually signed. */
  fullMessage: string;
  nonce: string;
}

export class AuthError extends Error {
  readonly status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

interface AuthState {
  /** Nonces already spent, so a captured signature can't be replayed. */
  nonces: Map<string, number>;
  /** sha256(token) -> session. Hashed so a memory dump isn't a set of live tokens. */
  sessions: Map<string, { wallet: string; expiresAt: number }>;
}

const state: AuthState = ((global as any).bpAuth ??= {
  nonces: new Map(),
  sessions: new Map(),
});

function normalizeAddress(address: string): string {
  try {
    return AccountAddress.from(address).toStringLong();
  } catch {
    throw new AuthError('Invalid wallet address', 400);
  }
}

function consumeNonce(nonce: string, now: number) {
  for (const [seen, expiresAt] of state.nonces) {
    if (expiresAt <= now) state.nonces.delete(seen);
  }
  if (state.nonces.has(nonce)) {
    throw new AuthError('Signature has already been used');
  }
  state.nonces.set(nonce, now + MAX_SIGNATURE_AGE_MS);
}

function assertStrings(input: unknown, fields: (keyof SignedSession)[]): SignedSession {
  if (typeof input !== 'object' || input === null) {
    throw new AuthError('Malformed signature payload', 400);
  }
  const candidate = input as Partial<SignedSession>;
  for (const field of fields) {
    if (typeof candidate[field] !== 'string' || !candidate[field]) {
      throw new AuthError(`Signature payload is missing "${field}"`, 400);
    }
  }
  return candidate as SignedSession;
}

/**
 * Verifies a wallet-signed session request and returns the wallet address it
 * proves ownership of, normalized to its long form.
 *
 * Throws AuthError if the signature is missing, expired, replayed, scoped to a
 * different app, or doesn't match the claimed wallet.
 */
export function verifySignedSession(input: unknown): string {
  const signed = assertStrings(input, [
    'wallet',
    'publicKey',
    'signature',
    'message',
    'fullMessage',
    'nonce',
  ]);

  let payload: SessionPayload;
  try {
    payload = JSON.parse(signed.message);
  } catch {
    throw new AuthError('Signed message is not valid JSON');
  }

  if (payload.domain !== AUTH_DOMAIN) {
    throw new AuthError('Signature was not issued for BuildProof', 403);
  }

  const now = Date.now();
  if (
    typeof payload.timestamp !== 'number' ||
    Math.abs(now - payload.timestamp) > MAX_SIGNATURE_AGE_MS
  ) {
    throw new AuthError('Signature has expired');
  }

  const claimed = normalizeAddress(signed.wallet);
  if (normalizeAddress(payload.wallet) !== claimed) {
    throw new AuthError('Signed wallet does not match the wallet in the request');
  }

  // The wallet signs `fullMessage`, not `message`, so that is what we verify
  // against. Confirming the payload and nonce are embedded in it stops a
  // signature captured from any other context being presented here.
  if (!signed.fullMessage.includes(signed.message) || !signed.fullMessage.includes(signed.nonce)) {
    throw new AuthError('Signed message does not match its payload');
  }

  let publicKey: Ed25519PublicKey;
  let signature: Ed25519Signature;
  try {
    publicKey = new Ed25519PublicKey(signed.publicKey);
    signature = new Ed25519Signature(signed.signature);
  } catch {
    throw new AuthError(
      'Unsupported key type — BuildProof requires an Ed25519 wallet such as Petra',
    );
  }

  // Binding the key to the address is what makes the claim meaningful: without
  // it, any valid signature from any key would authenticate any wallet.
  if (publicKey.authKey().derivedAddress().toStringLong() !== claimed) {
    throw new AuthError('Public key does not correspond to the claimed wallet');
  }

  const signedBytes = new TextEncoder().encode(signed.fullMessage);
  if (!publicKey.verifySignature({ message: signedBytes, signature })) {
    throw new AuthError('Invalid signature');
  }

  consumeNonce(signed.nonce, now);

  return claimed;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Issues a bearer token for an already-verified wallet. */
export function issueSession(wallet: string): { token: string; expiresAt: number } {
  const now = Date.now();
  for (const [hash, session] of state.sessions) {
    if (session.expiresAt <= now) state.sessions.delete(hash);
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = now + SESSION_TTL_MS;
  state.sessions.set(hashToken(token), { wallet, expiresAt });
  return { token, expiresAt };
}

/**
 * Resolves the `Authorization: Bearer <token>` header to the wallet that owns
 * the session. Throws AuthError if the token is missing, unknown, or expired.
 */
export function requireSession(request: Request): string {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('Missing session token — connect your wallet');
  }

  const hash = hashToken(header.slice('Bearer '.length).trim());
  const session = state.sessions.get(hash);
  if (!session) {
    throw new AuthError('Session is not valid — sign in again');
  }
  if (session.expiresAt <= Date.now()) {
    state.sessions.delete(hash);
    throw new AuthError('Session has expired — sign in again');
  }

  return session.wallet;
}

/**
 * Same as requireSession, but also asserts the request body attributes the
 * record to that wallet, so a signed-in user can't write records authored by
 * someone else. Returns the verified address.
 */
export function requireSessionMatching(
  request: Request,
  claimedField: unknown,
  fieldName: string,
): string {
  const wallet = requireSession(request);
  if (typeof claimedField !== 'string' || normalizeAddress(claimedField) !== wallet) {
    throw new AuthError(`"${fieldName}" must be the authenticated wallet`, 403);
  }
  return wallet;
}

/** Normalizes an address for comparison, without requiring a session. */
export { normalizeAddress };
