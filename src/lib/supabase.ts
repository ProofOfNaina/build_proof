import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client.
//
// Uses a SECRET key, which bypasses row-level security. That is deliberate: the
// tables have RLS enabled with no policies, so they are unreachable from the
// browser, and every write goes through an API route that has already verified a
// wallet signature.
//
// The key is intentionally NOT prefixed with NEXT_PUBLIC_ — that prefix would
// inline it into the client bundle and hand every visitor full database access.
// Never import this module from a client component.

const url =
  process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

// Supabase renamed its keys: the legacy `service_role` JWT and the newer
// `sb_secret_…` are both accepted here under either variable name.
const secretKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();

/**
 * The publishable (anon) key, if set. Safe to expose — it is designed for
 * browsers — but useless to this app: it is subject to RLS, and the tables have
 * no policies. Tracked only so the warning below can be specific.
 */
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigured = Boolean(url && secretKey);

let client: SupabaseClient | null = null;

if (supabaseConfigured) {
  client = createClient(url!, secretKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else if (process.env.NODE_ENV !== 'test') {
  const reason =
    url && publishableKey && !secretKey
      ? 'only a publishable key is set. That key is subject to row-level security, and ' +
        'these tables have no policies, so it cannot read or write. Set SUPABASE_SECRET_KEY ' +
        '(Project Settings -> API Keys -> secret) instead.'
      : 'SUPABASE_URL / SUPABASE_SECRET_KEY are not set.';

  console.warn(
    `[BuildProof] Using the in-process store — ${reason} ` +
      'Data will not survive a restart. See supabase/schema.sql for setup.',
  );
}

/** The Supabase client, or null when the app is running on the fallback store. */
export const supabase = client;
