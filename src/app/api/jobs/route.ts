import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/apiError';
import { asObject, compact, optionalString, optionalUrl, requiredString } from '@/lib/validate';

export async function GET() {
  const jobs = db.getJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    // Any connected wallet may post a job, but it must identify itself.
    const postedBy = requireSession(request);

    const job = db.createJob({
      title: requiredString(body.title, 'title', 120),
      company: requiredString(body.company, 'company', 120),
      description: requiredString(body.description, 'description', 5000),
      location: requiredString(body.location, 'location', 100),
      type: optionalString(body.type, 'type', 40) ?? 'Full-time',
      salary: optionalString(body.salary, 'salary', 60) ?? 'Competitive',
      logo: optionalUrl(body.logo, 'logo') ?? '',
      ...compact({ postedBy }),
    });

    return NextResponse.json(job);
  } catch (error) {
    return errorResponse(error);
  }
}
