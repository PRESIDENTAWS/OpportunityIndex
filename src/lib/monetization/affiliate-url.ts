/**
 * Redirect safety and UTM construction.
 *
 * Deliberately free of Supabase, `server-only`, and Next imports so it can be
 * unit-tested directly — these are the rules that decide whether an outbound
 * redirect is safe, so they are the rules most worth testing.
 */

import type { ResolvedAffiliateLink } from "./types";

/** The attribution cookie holds the click UUID and nothing else. */
export const CLICK_COOKIE_NAME = "oi_click";

/** Matches the affiliate network's typical 30-day window. */
export const CLICK_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type DestinationRejection =
  | "not-absolute"
  | "not-https"
  | "credentials-in-url"
  | "no-host";

export type DestinationCheck =
  | { ok: true; url: URL }
  | { ok: false; reason: DestinationRejection };

/**
 * Validates a stored destination before we send a visitor to it.
 *
 * The destination always comes from our own database — never from the request —
 * so this is defence in depth against a bad row rather than against user input.
 * A row that fails here is treated as a dead link, not as something to sanitise.
 */
export function checkDestination(raw: string): DestinationCheck {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "not-absolute" };
  }

  // Plaintext hops would leak the affiliate identifier in transit.
  if (url.protocol !== "https:") return { ok: false, reason: "not-https" };
  if (!url.hostname) return { ok: false, reason: "no-host" };
  // `https://user:pass@evil.example.com` renders deceptively in some clients.
  if (url.username || url.password) return { ok: false, reason: "credentials-in-url" };

  return { ok: true, url };
}

/** True when the link is live: active, program active, and not expired. */
export function isLinkRedeemable(
  link: Pick<ResolvedAffiliateLink, "is_active" | "expires_at" | "program">,
  now: Date = new Date(),
): boolean {
  if (!link.is_active) return false;
  if (!link.program.is_active) return false;
  if (link.expires_at && new Date(link.expires_at).getTime() <= now.getTime()) return false;
  return true;
}

export interface UtmContext {
  programSlug: string;
  categorySlug?: string | null;
  opportunitySlug?: string | null;
}

/**
 * Builds the final outbound URL.
 *
 * Two rules matter here:
 *
 *  1. **The affiliate identifier is never touched.** Whatever the network put in
 *     the stored URL — `irclickid`, `ref`, `aff_id`, a path segment — is
 *     preserved exactly. UTMs are analytics attribution and earn nothing on
 *     their own; the network's own parameter is what pays.
 *
 *  2. **Existing UTMs win.** If the merchant supplied a tracking URL that
 *     already carries `utm_*`, they chose it deliberately and we do not
 *     overwrite it.
 */
export function buildRedirectUrl(destination: URL, context: UtmContext): URL {
  const url = new URL(destination.toString());

  const utms: Record<string, string | null | undefined> = {
    utm_source: context.programSlug,
    utm_medium: "affiliate",
    utm_campaign: context.categorySlug,
    utm_content: context.opportunitySlug,
  };

  for (const [key, value] of Object.entries(utms)) {
    if (!value) continue;
    if (url.searchParams.has(key)) continue;
    url.searchParams.set(key, value);
  }

  return url;
}

/** Host only — a full referrer can carry query parameters we have no need for. */
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname || null;
  } catch {
    return null;
  }
}

/**
 * Coarse device bucket from a User-Agent.
 *
 * Intentionally crude: this is for reporting shape, not fingerprinting, and a
 * coarser signal is the privacy-preserving choice.
 */
export function deviceType(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|iphone|android.+mobile|phone/.test(ua)) return "mobile";
  if (/bot|crawler|spider|crawling/.test(ua)) return "bot";
  return "desktop";
}
