import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { isKitConfigured, subscribeToKit } from "./kit";

/**
 * Newsletter subscription.
 *
 * `newsletter_subscribers` — created by supabase/schema.sql — stays the local
 * source of record. No second subscriber table exists. Kit is a downstream
 * delivery provider, so a Kit outage must not lose a signup.
 */

/**
 * Pragmatic email validation.
 *
 * Deliberately not RFC 5322: an over-strict pattern rejects valid addresses,
 * and the real confirmation is the double opt-in email.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export interface SubscribeInput {
  email: string;
  /** Must be true. Consent is explicit or the signup is refused. */
  consent: boolean;
  /** Where the signup happened, e.g. "footer", "newsletter-page". */
  source: string;
}

export type SubscribeResult =
  | { ok: true; storedLocally: boolean; forwardedToProvider: boolean }
  | { ok: false; reason: "invalid-email" | "consent-required" };

/**
 * Records a subscription locally, then forwards it to Kit when configured.
 *
 * In local development with neither Supabase nor Kit configured this still
 * succeeds, so the form flow stays testable — the fallback path.
 */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const email = input.email.trim().toLowerCase();

  if (!isValidEmail(email)) return { ok: false, reason: "invalid-email" };
  if (!input.consent) return { ok: false, reason: "consent-required" };

  const consentAt = new Date().toISOString();
  let storedLocally = false;
  let forwardedToProvider = false;
  let providerSubscriberId: string | null = null;

  if (isKitConfigured()) {
    const result = await subscribeToKit(email);
    if (result.ok) {
      forwardedToProvider = true;
      providerSubscriberId = result.subscriberId;
    }
  }

  const supabase = getServerSupabase();
  if (supabase) {
    // Idempotent on the unique email: a repeat signup refreshes the record
    // rather than erroring or duplicating.
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email,
        source: input.source,
        // consent_at is when the box was ticked; confirmed_at is set later by
        // the double opt-in flow, so it is deliberately not written here.
        consent_at: consentAt,
        provider_subscriber_id: providerSubscriberId,
      },
      { onConflict: "email" },
    );
    if (error) {
      console.error("[newsletter] local store failed:", error.code ?? "unknown");
    } else {
      storedLocally = true;
    }
  }

  return { ok: true, storedLocally, forwardedToProvider };
}
