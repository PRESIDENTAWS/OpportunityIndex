/**
 * Every analytics endpoint, in one place.
 *
 * ## Verification status
 *
 * These URLs could NOT be checked against live documentation from the build
 * environment — outbound access to `developers.google.com` and `plausible.io`
 * is blocked by the network egress proxy. Confirm each against the official
 * docs before going live; they are centralised here so a correction is a
 * one-line change rather than a hunt through the codebase.
 *
 *   GA4 Measurement Protocol
 *     https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference
 *   Plausible Events API
 *     https://plausible.io/docs/events-api
 *   Plausible Stats API (v2)
 *     https://plausible.io/docs/stats-api
 */

/** GA4 Measurement Protocol — production ingest. */
export const GA4_COLLECT_ENDPOINT = "https://www.google-analytics.com/mp/collect";

/**
 * GA4 Measurement Protocol — validation endpoint.
 *
 * The production endpoint answers 2xx even for a malformed payload, so a 200
 * from `mp/collect` proves nothing. This endpoint returns a
 * `validationMessages` array describing what is wrong, which is the only
 * programmatic way to catch a bad event before it silently vanishes.
 */
export const GA4_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

/**
 * Plausible Events API.
 *
 * Note the path: `/api/event`, singular and unversioned. `/api/v1/events` is
 * not the events endpoint.
 */
export const PLAUSIBLE_EVENT_ENDPOINT = "https://plausible.io/api/event";

/**
 * Plausible Stats API v2.
 *
 * The v1 Stats API is legacy; new integrations use v2's single query endpoint.
 * Only the Stats API needs a token — the Events API above must NOT be sent one.
 */
export const PLAUSIBLE_STATS_ENDPOINT = "https://plausible.io/api/v2/query";

/**
 * The event names this application emits.
 *
 * Kept as a closed set so a typo cannot silently create a parallel event that
 * never appears in a report.
 */
export const ANALYTICS_EVENTS = {
  affiliateClick: "affiliate_click",
  emailSignup: "email_signup",
  sponsorClick: "sponsor_click",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
