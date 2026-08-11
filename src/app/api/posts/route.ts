import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSessionMatching } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';
import { asObject, compact, optionalString, optionalUrl } from '@/lib/validate';

export async function GET() {
  const posts = db.getPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    // Authorship is proved, not asserted — no posting as another wallet.
    const author = requireSessionMatching(request, body.author, 'author');

    const content = optionalString(body.content, 'content', 5000) ?? '';
    const mediaUrl = optionalUrl(body.mediaUrl, 'mediaUrl');
    if (!content && !mediaUrl) {
      return NextResponse.json(
        { error: 'A post needs either content or media' },
        { status: 400 },
      );
    }

    const rawMediaType = optionalString(body.mediaType, 'mediaType', 10);
    if (rawMediaType !== undefined && rawMediaType !== 'image' && rawMediaType !== 'pdf') {
      return NextResponse.json(
        { error: '"mediaType" must be "image" or "pdf"' },
        { status: 400 },
      );
    }
    const mediaType: 'image' | 'pdf' | undefined = rawMediaType;

    const post = db.createPost({
      author,
      content,
      ...compact({
        mediaUrl,
        mediaType: mediaUrl ? mediaType : undefined,
        mediaName: mediaUrl ? optionalString(body.mediaName, 'mediaName', 255) : undefined,
        explorerUrl: optionalUrl(body.explorerUrl, 'explorerUrl'),
      }),
    });

    return NextResponse.json(post);
  } catch (error) {
    return errorResponse(error);
  }
}
