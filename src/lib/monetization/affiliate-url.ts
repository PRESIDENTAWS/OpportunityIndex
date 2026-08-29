/**
 * Redirect safety and UTM construction.
 *
 * Deliberately free of Supabase, `server-only`, and Next imports so it can be
 * unit-tested directly — these are the rules that decide whether an outbound
 * redirect is safe, so they are the rules most worth testing.
 */

import type { ResolvedAffiliateLink } from "./types";

/**
 * The attribution cookie holds the click UUID and nothing else.
 *
 * It is httpOnly: no client-side code reads it. The authoritative attribution
 * record is the `affiliate_clicks` row, not this cookie — the cookie exists so
 * a later conversion can be tied back to a click, and a value the browser can
 * read is a value the browser can forge.
 */
export const CLICK_COOKIE_NAME = "oi_click";

/** Used when a program does not state its own cookie window. */
export const DEFAULT_CLICK_WINDOW_DAYS = 30;

/**
 * Cookie lifetime for a click, in seconds.
 *
 * Prefers the program's own `cookie_window_days` so attribution matches the
 * window the network actually honours; a 30-day cookie against a 7-day program
 * claims credit the network will not pay.
 */
export function clickCookieMaxAgeSeconds(
  cookieWindowDays?: number | null,
): number {
  const days =
    typeof cookieWindowDays === "number" && cookieWindowDays > 0
      ? cookieWindowDays
      : DEFAULT_CLICK_WINDOW_DAYS;
  return days * 24 * 60 * 60;
}

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
 * Known non-human User-Agents.
 *
 * Checked before the device buckets, because several crawlers advertise a
 * mobile UA and would otherwise be filed as phones.
 */
const BOT_PATTERN =
  /bot\b|bots\b|crawler|crawling|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|twitterbot|linkedinbot|embedly|quora link preview|pinterest|redditbot|applebot|duckduckbot|yandex|baiduspider|semrush|ahrefs|mj12bot|dotbot|petalbot|headlesschrome|phantomjs|puppeteer|playwright|python-requests|curl\/|wget\/|go-http-client|okhttp|axios\/|node-fetch/i;

/**
 * True when the User-Agent is a known bot, or absent entirely.
 *
 * A missing User-Agent is treated as non-human: every real browser sends one,
 * and scripted traffic frequently does not.
 */
export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent || userAgent.trim() === "") return true;
  return BOT_PATTERN.test(userAgent);
}

/**
 * Whether a click should be written to `affiliate_clicks`.
 *
 * Bot traffic still gets redirected — link previews and crawlers should resolve
 * normally — but it is not recorded, because a click log padded with crawler
 * hits inflates click-through rates and makes conversion rates look worse than
 * they are.
 */
export function isRecordableClick(userAgent: string | null): boolean {
  return !isBotUserAgent(userAgent);
}

/**
 * Coarse device bucket from a User-Agent.
 *
 * Intentionally crude: this is for reporting shape, not fingerprinting, and a
 * coarser signal is the privacy-preserving choice.
 */
export function deviceType(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (isBotUserAgent(userAgent)) return "bot";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|iphone|android.+mobile|phone/.test(ua)) return "mobile";
  return "desktop";
}
