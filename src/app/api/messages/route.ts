import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user1 = searchParams.get('user1');
  const user2 = searchParams.get('user2');

  if (!user1 || !user2) {
    return NextResponse.json({ error: 'Missing user1 or user2' }, { status: 400 });
  }

  const messages = db.getMessages(user1, user2);
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = db.createMessage(body);
  return NextResponse.json(message);
}
