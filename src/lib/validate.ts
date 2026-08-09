// Input validation for the BuildProof API.
//
// The routes previously wrote `await request.json()` straight into the store,
// so anything a client sent became part of a record. These helpers keep writes
// to a known shape with bounded field lengths.

export class ValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

/** A required, non-empty string no longer than `maxLength`. */
export function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`"${field}" is required`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`"${field}" must be ${maxLength} characters or fewer`);
  }
  return value.trim();
}

/** An optional string; absent/empty becomes undefined. */
export function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError(`"${field}" must be a string`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`"${field}" must be ${maxLength} characters or fewer`);
  }
  return value.trim();
}

/**
 * An optional URL restricted to http(s), so a stored value can never become a
 * `javascript:` or `data:` URI that later lands in an href or img src.
 */
export function optionalUrl(value: unknown, field: string): string | undefined {
  const raw = optionalString(value, field, 2048);
  if (raw === undefined) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ValidationError(`"${field}" must be a valid URL`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ValidationError(`"${field}" must be an http(s) URL`);
  }
  return parsed.toString();
}

/** Strips undefined values so they don't overwrite stored fields on merge. */
export function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
