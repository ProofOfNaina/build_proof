import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeAddress } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> },
) {
  try {
    const { wallet } = await params;
    // Profiles are stored under the normalized address, so look up the same way.
    const user = await db.getUser(normalizeAddress(wallet));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}
