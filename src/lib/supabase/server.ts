import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients.
 *
 * Public content should use the publishable-key client so Row Level Security
 * remains part of the read path. Privileged monetization/admin operations use
 * the secret-key client and must never be imported into client components.
 */

let cachedPublic: SupabaseClient | null = null;
let cachedService: SupabaseClient | null = null;

/** True when the public/RLS-enforced client can be created. */
export function isPublicSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** True when the privileged service client can be created. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/**
 * Returns the publishable-key client used for public repository reads.
 *
 * RLS remains enforced. When credentials are absent (for example local fixture
 * development or CI builds), callers may deliberately use their fixture
 * fallback instead of crashing at module load.
 */
export function getPublicSupabase(): SupabaseClient | null {
  if (!isPublicSupabaseConfigured()) return null;
  if (cachedPublic) return cachedPublic;

  cachedPublic = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "opportunity-index-public-server" } },
    },
  );

  return cachedPublic;
}

/**
 * Returns the secret-key client, or `null` when privileged credentials are not
 * configured. This client bypasses RLS and is reserved for server-only writes
 * and private operational tables.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cachedService) return cachedService;

  cachedService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "opportunity-index-service-server" } },
    },
  );

  return cachedService;
}
