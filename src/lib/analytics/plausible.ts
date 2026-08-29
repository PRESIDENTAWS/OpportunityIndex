import "server-only";

import {
  PLAUSIBLE_EVENT_ENDPOINT,
  PLAUSIBLE_STATS_ENDPOINT,
  type AnalyticsEventName,
} from "./constants";

/**
 * Optional Plausible adapter, behind `PLAUSIBLE_ENABLED`.
 *
 * GA4 is the primary provider. This exists so a privacy-preserving alternative
 * can run alongside or replace it without rewriting call sites.
 *
 * Three details decide whether server-side Plausible works at all:
 *
 *  1. **The endpoint is `/api/event`** — singular, unversioned. `/api/v1/events`
 *     is not it.
 *  2. **The visitor's real User-Agent and IP must be forwarded**, via
 *     `User-Agent` and `X-Forwarded-For`. Plausible derives the visitor hash
 *     from them; send the server's own and every event collapses into one
 *     phantom visitor.
 *  3. **The Events API takes no token.** Only the Stats API is authenticated.
 *     Sending a Stats token to the Events endpoint is a misconfiguration.
 */

export function isPlausibleEnabled(): boolean {
  return process.env.PLAUSIBLE_ENABLED === "true" && Boolean(process.env.PLAUSIBLE_SITE_ID);
}

export interface PlausibleEventOptions {
  name: AnalyticsEventName | "pageview";
  /** Absolute URL of the page the event belongs to. */
  url: string;
  referrer?: string | null;
  props?: Record<string, string | number | boolean>;
  /** The visitor's User-Agent, forwarded verbatim. */
  userAgent: string;
  /** The visitor's IP, forwarded as X-Forwarded-For. Never stored by us. */
  clientIp: string | null;
  revenue?: { currency: string; amount: number };
}

/**
 * Sends one server-side event.
 *
 * The visitor's User-Agent and IP are forwarded as headers so Plausible
 * attributes the event to the right visitor. We pass them through and do not
 * retain them.
 */
export async function sendPlausibleEvent(
  options: PlausibleEventOptions,
): Promise<boolean> {
  if (!isPlausibleEnabled()) return false;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Required: Plausible derives the visitor hash from this.
    "User-Agent": options.userAgent,
  };
  // Required for correct geography and visitor hashing on server-side events.
  if (options.clientIp) headers["X-Forwarded-For"] = options.clientIp;

  try {
    const response = await fetch(PLAUSIBLE_EVENT_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: options.name,
        url: options.url,
        domain: process.env.PLAUSIBLE_SITE_ID,
        referrer: options.referrer ?? undefined,
        props: options.props,
        revenue: options.revenue,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Queries the Plausible Stats API v2.
 *
 * v1 is legacy. This endpoint requires `PLAUSIBLE_STATS_API_KEY` — which the
 * Events API above must never be given.
 */
export async function queryPlausibleStats(
  query: Record<string, unknown>,
): Promise<unknown | null> {
  const apiKey = process.env.PLAUSIBLE_STATS_API_KEY;
  const siteId = process.env.PLAUSIBLE_SITE_ID;
  if (!apiKey || !siteId) return null;

  try {
    const response = await fetch(PLAUSIBLE_STATS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ site_id: siteId, ...query }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
