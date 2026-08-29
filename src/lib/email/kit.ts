import "server-only";

/**
 * Kit (formerly ConvertKit) — v4 API client.
 *
 * ## Version
 *
 * v3 used `api_key` as a query/body parameter against `api.convertkit.com/v3`.
 * v4 uses a header against `api.kit.com/v4`. The v3 sequence, form, and tag
 * endpoints are not interchangeable with v4's.
 *
 * ## Verification status
 *
 * The exact v4 paths and header name below could NOT be checked against live
 * documentation: outbound access to `developers.kit.com` is blocked by the
 * network egress proxy in this environment. They are centralised in
 * `KIT_API_BASE` / `KIT_AUTH_HEADER` / the two path builders so a correction is
 * a one-line change. Confirm against the v4 migration guide before enabling:
 *
 *   https://developers.kit.com/api-reference/upgrading-to-v4
 *
 * This integration is inert until `KIT_API_KEY` is set, so an unverified detail
 * cannot silently misbehave in production — it simply stays off.
 */

const KIT_API_BASE = "https://api.kit.com/v4";
const KIT_AUTH_HEADER = "X-Kit-Api-Key";

/** Subscriber upsert. Kit treats a repeat call for the same email as an update. */
const subscribersPath = () => `${KIT_API_BASE}/subscribers`;

/** Adds an existing subscriber to a form. */
const formSubscribePath = (formId: string) =>
  `${KIT_API_BASE}/forms/${encodeURIComponent(formId)}/subscribers`;

export function isKitConfigured(): boolean {
  return Boolean(process.env.KIT_API_KEY);
}

export type KitResult =
  | { ok: true; subscriberId: string | null }
  | { ok: false; reason: "not-configured" | "request-failed" | "rejected" };

/**
 * Subscribes an email address.
 *
 * Idempotent: Kit upserts on email, and adding an already-subscribed address to
 * a form is a no-op there, so a double submit does not create a duplicate.
 *
 * Provider responses are never returned to the caller — they can echo the
 * submitted address and internal detail. Failures are logged server-side and
 * reduced to a coarse reason code.
 */
export async function subscribeToKit(email: string): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return { ok: false, reason: "not-configured" };

  const headers = {
    "Content-Type": "application/json",
    [KIT_AUTH_HEADER]: apiKey,
  };

  try {
    const response = await fetch(subscribersPath(), {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email }),
    });

    if (!response.ok) {
      console.error(`[kit] subscriber upsert failed with status ${response.status}`);
      return { ok: false, reason: "rejected" };
    }

    const body = (await response.json()) as { subscriber?: { id?: number | string } };
    const subscriberId = body.subscriber?.id != null ? String(body.subscriber.id) : null;

    // Optional: a form drives the sequence and double opt-in confirmation.
    const formId = process.env.KIT_FORM_ID;
    if (formId) {
      const formResponse = await fetch(formSubscribePath(formId), {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address: email }),
      });
      if (!formResponse.ok) {
        // The subscriber exists; only the form association failed. Worth
        // knowing about, but not worth failing the signup over.
        console.error(`[kit] form subscribe failed with status ${formResponse.status}`);
      }
    }

    return { ok: true, subscriberId };
  } catch {
    console.error("[kit] request failed");
    return { ok: false, reason: "request-failed" };
  }
}
