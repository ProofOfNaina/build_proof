import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSessionMatching } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';
import { asObject, compact, optionalString, optionalUrl } from '@/lib/validate';

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    // A profile may only be written by the wallet that owns it.
    const wallet = requireSessionMatching(request, body.wallet, 'wallet');

    const user = db.createUser({
      wallet,
      // Both default to empty: a wallet may save a profile before filling it in,
      // and the UI already falls back to placeholder text.
      name: optionalString(body.name, 'name', 80) ?? '',
      bio: optionalString(body.bio, 'bio', 500) ?? '',
      ...compact({
        location: optionalString(body.location, 'location', 100),
        website: optionalUrl(body.website, 'website'),
        github: optionalString(body.github, 'github', 39),
        twitter: optionalString(body.twitter, 'twitter', 15),
        linkedin: optionalUrl(body.linkedin, 'linkedin'),
        avatarUrl: optionalUrl(body.avatarUrl, 'avatarUrl'),
        resumeUrl: optionalUrl(body.resumeUrl, 'resumeUrl'),
        role: optionalString(body.role, 'role', 80),
      }),
    });

    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}
