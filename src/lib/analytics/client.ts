"use client";

import { ANALYTICS_EVENTS, type AnalyticsEventName } from "./constants";

/**
 * Browser-side analytics helpers.
 *
 * Safe to call when GA4 is not configured: `gtag` is simply absent and every
 * call becomes a no-op rather than throwing.
 */

type GtagArgs =
  | ["event", string, Record<string, unknown>?]
  | ["get", string, string, (value: string | undefined) => void];

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

export function trackAffiliateClick(params: {
  program: string;
  opportunity?: string | null;
  placement?: string | null;
}): void {
  trackEvent(ANALYTICS_EVENTS.affiliateClick, {
    program: params.program,
    opportunity: params.opportunity ?? undefined,
    placement: params.placement ?? undefined,
  });
}

export function trackEmailSignup(source: string): void {
  trackEvent(ANALYTICS_EVENTS.emailSignup, { source });
}

export function trackSponsorClick(params: {
  sponsor: string;
  placement?: string | null;
}): void {
  trackEvent(ANALYTICS_EVENTS.sponsorClick, {
    sponsor: params.sponsor,
    placement: params.placement ?? undefined,
  });
}

/**
 * Reads the browser's GA `client_id` and `session_id`.
 *
 * Needed when correlating a server-side Measurement Protocol event with the
 * browser session: a server event carrying a freshly generated client id counts
 * as a different user, which quietly breaks attribution.
 */
export function getGaIdentifiers(
  measurementId: string,
): Promise<{ clientId?: string; sessionId?: string }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.gtag) return resolve({});

    let clientId: string | undefined;
    let sessionId: string | undefined;
    let settled = false;

    const done = () => {
      if (settled) return;
      settled = true;
      resolve({ clientId, sessionId });
    };

    // gtag's callbacks are not guaranteed to fire; never hang a caller on them.
    const timeout = setTimeout(done, 500);
    const finish = () => {
      if (clientId !== undefined && sessionId !== undefined) {
        clearTimeout(timeout);
        done();
      }
    };

    window.gtag("get", measurementId, "client_id", (value) => {
      clientId = value;
      finish();
    });
    window.gtag("get", measurementId, "session_id", (value) => {
      sessionId = value;
      finish();
    });
  });
}
