import "server-only";

import {
  GA4_COLLECT_ENDPOINT,
  GA4_DEBUG_ENDPOINT,
  safeGaMeasurementId,
  type AnalyticsEventName,
} from "./constants";

/**
 * GA4 Measurement Protocol — server-side events.
 *
 * `GA_API_SECRET` is server-only and must never reach the browser.
 *
 * Two things make server-side GA4 easy to get silently wrong, and both are
 * handled here:
 *
 *  1. **The production endpoint returns 2xx for malformed payloads.** A 204 is
 *     not evidence the event was accepted. `validateEvent` posts to the debug
 *     endpoint and surfaces `validationMessages`; in development every send is
 *     validated first and problems are logged loudly.
 *
 *  2. **A server event with a fresh `client_id` is a different user.** The
 *     browser's `client_id` (and `session_id`) must be carried through from the
 *     page, or server events will not join the browser session and attribution
 *     will look wrong. `clientId` is therefore required, not optional.
 */

export interface Ga4EventParams {
  [key: string]: string | number | boolean | undefined;
  /** Required by GA4 to attribute the event to the right session. */
  session_id?: string;
  /** Suppresses the "(not set)" engagement warning on server events. */
  engagement_time_msec?: number;
}

export interface Ga4Event {
  name: AnalyticsEventName;
  params?: Ga4EventParams;
}

export interface SendGa4Options {
  /** The browser's GA client_id. Without it the event is a different user. */
  clientId: string;
  events: Ga4Event[];
  /** Overrides the automatic dev-mode validation. */
  validate?: boolean;
}

function credentials(): { measurementId: string; apiSecret: string } | null {
  // Validated, not merely present: a malformed ID is refused here too, so a
  // bad value cannot reach the network layer either.
  const measurementId = safeGaMeasurementId();
  const apiSecret = process.env.GA_API_SECRET;
  if (!measurementId || !apiSecret) return null;
  return { measurementId, apiSecret };
}

function buildPayload({ clientId, events }: SendGa4Options) {
  return {
    client_id: clientId,
    events: events.map((event) => ({
      name: event.name,
      params: {
        // GA4 drops server events from engagement reporting without this.
        engagement_time_msec: 1,
        ...event.params,
      },
    })),
  };
}

export interface Ga4ValidationResult {
  valid: boolean;
  messages: { description?: string; validationCode?: string }[];
}

/**
 * Posts an event to the GA4 debug endpoint and returns its complaints.
 *
 * Use this in development and in tests. It never sends a real event.
 */
export async function validateEvent(
  options: SendGa4Options,
): Promise<Ga4ValidationResult> {
  const creds = credentials();
  if (!creds) return { valid: false, messages: [{ description: "GA4 not configured" }] };

  const url = `${GA4_DEBUG_ENDPOINT}?measurement_id=${encodeURIComponent(creds.measurementId)}&api_secret=${encodeURIComponent(creds.apiSecret)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(options)),
    });
    const body = (await response.json()) as {
      validationMessages?: { description?: string; validationCode?: string }[];
    };
    const messages = body.validationMessages ?? [];
    return { valid: messages.length === 0, messages };
  } catch {
    return { valid: false, messages: [{ description: "Validation request failed" }] };
  }
}

/**
 * Sends server-side events to GA4.
 *
 * Returns false when unconfigured or when the request fails. Analytics must
 * never break a user-facing request, so callers ignore the result on hot paths.
 *
 * ## Conversion events
 *
 * Do NOT call this to report a conversion. No caller in this codebase sends a
 * server-side conversion event, and none may until a real affiliate conversion
 * has been verified through a working network adapter. Both adapters are
 * hard-disabled, so no verified conversion exists yet — a purchase or revenue
 * event emitted now would be fabricated data in a reporting system people make
 * spending decisions from.
 */
export async function sendGa4Event(options: SendGa4Options): Promise<boolean> {
  const creds = credentials();
  if (!creds) return false;

  // Default to validating in development, where a silent 204 hides mistakes.
  const shouldValidate = options.validate ?? process.env.NODE_ENV !== "production";
  if (shouldValidate) {
    const result = await validateEvent(options);
    if (!result.valid) {
      console.warn(
        "[ga4] Measurement Protocol validation failed:",
        result.messages.map((m) => m.description ?? m.validationCode).join("; "),
      );
    }
  }

  const url = `${GA4_COLLECT_ENDPOINT}?measurement_id=${encodeURIComponent(creds.measurementId)}&api_secret=${encodeURIComponent(creds.apiSecret)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(options)),
    });
    // A 2xx here is not proof of acceptance — that is what validateEvent is for.
    return response.ok;
  } catch {
    return false;
  }
}
