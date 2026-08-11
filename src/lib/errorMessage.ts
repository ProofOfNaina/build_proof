import axios from 'axios';

/**
 * Recognizes upstream auth failures that surface as gibberish.
 *
 * Aptos/Shelby endpoints answer a bad API key with a plain-text body
 * (`Unauthorized: API key not found`), but their clients parse responses as
 * JSON — so the error that reaches us is
 * `Unexpected token 'U', "Unauthoriz"... is not valid JSON`, which says nothing
 * about the real cause.
 */
function describeUpstreamAuthFailure(raw: string): string | null {
  const looksLikeParsedUnauthorized =
    /is not valid JSON/i.test(raw) && /Unauthoriz/i.test(raw);

  if (looksLikeParsedUnauthorized || /API key not found/i.test(raw)) {
    return (
      'The network rejected the request: the API key is not valid for the selected ' +
      'Shelby network. Either clear NEXT_PUBLIC_SHELBY_API_KEY (shelbynet works ' +
      'without one) or set NEXT_PUBLIC_SHELBY_API_KEY_NETWORK to the network the ' +
      'key was issued for.'
    );
  }

  if (/Origin header is required/i.test(raw)) {
    return 'The network requires an Origin header for this API key. Check the key’s allowed origins.';
  }

  return null;
}

/**
 * Pulls a useful message out of a failed request so users see why something was
 * rejected (expired session, validation failure, bad API key) instead of a
 * generic retry prompt.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.error;
    if (typeof detail === 'string' && detail) return detail;
  }

  if (error instanceof Error && error.message) {
    return describeUpstreamAuthFailure(error.message) ?? error.message;
  }

  return fallback;
}
