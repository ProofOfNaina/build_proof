import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const jobs = db.getJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const job = db.createJob(body);
  return NextResponse.json(job);
}
