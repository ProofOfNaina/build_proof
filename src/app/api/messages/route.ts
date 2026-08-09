import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeAddress, requireSession, requireSessionMatching, AuthError } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';
import { asObject, compact, optionalUrl, requiredString } from '@/lib/validate';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'Missing user1 or user2' }, { status: 400 });
    }

    // A conversation is readable only by the two wallets in it.
    const reader = requireSession(request);
    const participants = [normalizeAddress(user1), normalizeAddress(user2)];
    if (!participants.includes(reader)) {
      throw new AuthError('You are not a participant in this conversation', 403);
    }

    return NextResponse.json(db.getMessages(participants[0], participants[1]));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    const sender = requireSessionMatching(request, body.sender, 'sender');

    const message = db.createMessage({
      sender,
      receiver: normalizeAddress(requiredString(body.receiver, 'receiver', 100)),
      text: requiredString(body.text, 'text', 2000),
      ...compact({ mediaUrl: optionalUrl(body.mediaUrl, 'mediaUrl') }),
    });

    return NextResponse.json(message);
  } catch (error) {
    return errorResponse(error);
  }
}
