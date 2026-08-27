import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The server-only Supabase client.
 *
 * It authenticates with `SUPABASE_SECRET_KEY`, which bypasses Row Level
 * Security, so this module must never be imported by a client component. The
 * `server-only` import above turns that mistake into a build error rather than
 * a runtime credential leak.
 *
 * Every monetization table denies `anon` and `authenticated` outright, so this
 * client is the only way the application reads or writes them.
 */

let cached: SupabaseClient | null = null;

/** True when the deployment has Supabase credentials configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/**
 * Returns the service-role client, or `null` when Supabase is not configured.
 *
 * Null is a supported state, not an error: local development runs without
 * credentials, and callers degrade gracefully rather than crashing a page.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;

  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "opportunity-index-server" } },
    },
  );
  return cached;
}
