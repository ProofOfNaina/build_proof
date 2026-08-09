import axios from 'axios';

/**
 * Pulls the API's `{ error }` message out of a failed request so users see why
 * a write was rejected (expired session, validation failure) instead of a
 * generic retry prompt.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.error;
    if (typeof detail === 'string' && detail) return detail;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
