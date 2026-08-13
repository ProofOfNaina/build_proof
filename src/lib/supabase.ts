import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client.
//
// Uses the SERVICE ROLE key, which bypasses row-level security. That is
// deliberate: the tables have RLS enabled with no policies, so they are
// unreachable from the browser, and every write goes through an API route that
// has already verified a wallet signature.
//
// The key is intentionally NOT prefixed with NEXT_PUBLIC_ — that prefix would
// inline it into the client bundle and hand every visitor full database access.
// Never import this module from a client component.

const url = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const supabaseConfigured = Boolean(url && serviceRoleKey);

let client: SupabaseClient | null = null;

if (supabaseConfigured) {
  client = createClient(url!, serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.warn(
    '[BuildProof] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — ' +
      'falling back to the in-process store. Data will not survive a restart. ' +
      'See supabase/schema.sql to set up a database.',
  );
}

/** The Supabase client, or null when the app is running on the fallback store. */
export const supabase = client;
