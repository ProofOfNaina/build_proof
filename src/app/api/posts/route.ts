import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const posts = db.getPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = db.createPost(body);
  return NextResponse.json(post);
}
