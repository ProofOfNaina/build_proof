import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = db.createUser(body);
  return NextResponse.json(user);
}
