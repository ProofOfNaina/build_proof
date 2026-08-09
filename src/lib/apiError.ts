import { NextResponse } from 'next/server';
import { AuthError } from './auth';
import { ValidationError } from './validate';

/**
 * Maps auth/validation failures to their status codes and anything else to a
 * generic 500, so unexpected internal errors don't leak details to clients.
 */
export function errorResponse(error: unknown) {
  if (error instanceof AuthError || error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }
  console.error('Unhandled API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
