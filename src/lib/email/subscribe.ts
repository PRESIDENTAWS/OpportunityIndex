import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { isKitConfigured, subscribeToKit, type KitResult } from "./kit";
import { isValidEmail, normalizeSource, type SubscriberSource } from "./policy";

/**
 * Newsletter subscription.
 *
 * `newsletter_subscribers` — created by supabase/schema.sql — is the local
 * source of record. No second subscriber table exists. Kit is a downstream
 * delivery provider.
 *
 * ## Durability
 *
 * The local write happens **first**, and in production a signup is reported
 * successful only if that write succeeded. A subscriber who exists only in Kit
 * is a subscriber we cannot reconcile, unsubscribe, or migrate; losing the row
 * while telling the visitor "you're subscribed" is the worst outcome available.
 *
 * The credential-free success path exists **only in development**, so the form
 * stays testable locally without ever masking a real production failure.
 */

/** Storage port. Injectable so durability behaviour can be tested. */
export interface SubscriberStore {
  /** Upserts the subscriber. Must NOT write provider_subscriber_id. */
  upsert(input: {
    email: string;
    source: SubscriberSource;
    consentAt: string;
  }): Promise<boolean>;
  /** Attaches a provider id after a successful provider call. */
  attachProviderId(email: string, providerSubscriberId: string): Promise<void>;
}

/** Provider port. */
export interface EmailProvider {
  isConfigured(): boolean;
  subscribe(email: string): Promise<KitResult>;
}

export interface SubscribeDeps {
  store?: SubscriberStore | null;
  provider?: EmailProvider;
  /** Defaults to NODE_ENV. */
  isProduction?: boolean;
}

export interface SubscribeInput {
  email: string;
  /** Must be true. Consent is explicit or the signup is refused. */
  consent: boolean;
  source: unknown;
}

export type SubscribeResult =
  | { ok: true; storedLocally: boolean; forwardedToProvider: boolean }
  | {
      ok: false;
      reason: "invalid-email" | "consent-required" | "storage-failed";
    };

/** Supabase-backed store. Null when Supabase is unconfigured. */
export function defaultStore(): SubscriberStore | null {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  return {
    async upsert({ email, source, consentAt }) {
      // provider_subscriber_id is deliberately absent: including it here would
      // overwrite an existing id with null whenever the provider call later
      // fails, silently orphaning the record from Kit.
      const { error } = await supabase.from("newsletter_subscribers").upsert(
        {
          email,
          source,
          // consent_at is when the box was ticked; confirmed_at is set later by
          // the double opt-in flow, so it is deliberately not written here.
          consent_at: consentAt,
        },
        { onConflict: "email" },
      );
      if (error) {
        console.error("[newsletter] local store failed:", error.code ?? "unknown");
        return false;
      }
      return true;
    },

    async attachProviderId(email, providerSubscriberId) {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ provider_subscriber_id: providerSubscriberId })
        .eq("email", email);
      if (error) {
        console.error("[newsletter] provider id update failed:", error.code ?? "unknown");
      }
    },
  };
}

const defaultProvider: EmailProvider = {
  isConfigured: isKitConfigured,
  subscribe: subscribeToKit,
};

/**
 * Records a subscription locally, then forwards it to the provider.
 *
 * Returns `storage-failed` in production when the local write does not succeed.
 * In development an unconfigured store is treated as success so the form flow
 * remains testable without credentials.
 */
export async function subscribe(
  input: SubscribeInput,
  deps: SubscribeDeps = {},
): Promise<SubscribeResult> {
  const email = input.email.trim().toLowerCase();

  if (!isValidEmail(email)) return { ok: false, reason: "invalid-email" };
  if (!input.consent) return { ok: false, reason: "consent-required" };

  const source = normalizeSource(input.source);
  const consentAt = new Date().toISOString();

  const isProduction = deps.isProduction ?? process.env.NODE_ENV === "production";
  const store = deps.store !== undefined ? deps.store : defaultStore();
  const provider = deps.provider ?? defaultProvider;

  // 1. Local first. This is the record we own.
  let storedLocally = false;
  if (store) {
    storedLocally = await store.upsert({ email, source, consentAt });
    if (!storedLocally) {
      // Fail closed in every environment once a store exists: a store that is
      // present and erroring is a real fault, not a missing credential.
      return { ok: false, reason: "storage-failed" };
    }
  } else if (isProduction) {
    // No store configured in production is a misconfiguration, not a fallback.
    console.error("[newsletter] refusing signup: no subscriber store configured");
    return { ok: false, reason: "storage-failed" };
  }

  // 2. Provider second. A provider failure does not lose the signup, and does
  //    not clear an existing provider id.
  let forwardedToProvider = false;
  if (provider.isConfigured()) {
    const result = await provider.subscribe(email);
    if (result.ok) {
      forwardedToProvider = true;
      if (store && result.subscriberId) {
        await store.attachProviderId(email, result.subscriberId);
      }
    }
  }

  return { ok: true, storedLocally, forwardedToProvider };
}

export { isValidEmail, normalizeSource } from "./policy";
