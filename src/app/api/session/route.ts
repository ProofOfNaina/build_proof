import { NextResponse } from 'next/server';
import { issueSession, verifySignedSession, SESSION_TTL_MS } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';

/**
 * Exchanges a wallet signature for a short-lived bearer token.
 *
 * The client signs once here; every other authenticated route then accepts
 * `Authorization: Bearer <token>` instead of prompting the wallet again.
 */
export async function POST(request: Request) {
  try {
    const wallet = verifySignedSession(await request.json());
    const { token, expiresAt } = issueSession(wallet);
    return NextResponse.json({ token, wallet, expiresAt, ttlMs: SESSION_TTL_MS });
  } catch (error) {
    return errorResponse(error);
  }
}
