import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AffiliateClickInsert, ResolvedAffiliateLink } from "./types";

/**
 * Server-side affiliate link lookup and click recording.
 *
 * Reads and writes go through the service-role client, because every
 * monetization table denies `anon` outright.
 */

/**
 * Resolves an active link by its public slug.
 *
 * Returns null when Supabase is unconfigured (local development) or when no
 * matching row exists. Callers treat both as "no such link" and 404.
 */
export async function findAffiliateLink(
  slug: string,
): Promise<ResolvedAffiliateLink | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("affiliate_links")
    .select(
      `id, program_id, slug, label, destination_url, opportunity_slug,
       category_slug, placement, is_active, expires_at,
       program:affiliate_programs!inner ( id, slug, name, network, is_active )`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  // PostgREST types an embedded one-to-one relation as possibly-array.
  const program = Array.isArray(data.program) ? data.program[0] : data.program;
  if (!program) return null;

  return { ...data, program } as ResolvedAffiliateLink;
}

/**
 * Derives a salted, non-reversible visitor digest.
 *
 * The raw IP is used only as digest input and is never stored or logged. Without
 * `CLICK_HASH_SALT` configured we return null rather than storing a bare hash of
 * an IP, which would be trivially reversible by brute force over the IPv4 space.
 */
export function visitorHash(ip: string | null, userAgent: string | null): string | null {
  const salt = process.env.CLICK_HASH_SALT;
  if (!salt || !ip) return null;
  return createHash("sha256").update(`${salt}:${ip}:${userAgent ?? ""}`).digest("hex");
}

export function newClickId(): string {
  return randomUUID();
}

/**
 * Records a click.
 *
 * Returns whether the row was written. A failure here must never block the
 * redirect: losing one analytics row is a smaller harm than breaking an
 * outbound link the reader is waiting on.
 */
export async function recordClick(click: AffiliateClickInsert): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("affiliate_clicks").insert(click);
  if (error) {
    // Deliberately terse: no payload, no keys, nothing that could carry PII.
    console.error("[affiliate] click insert failed:", error.code ?? "unknown");
    return false;
  }
  return true;
}
