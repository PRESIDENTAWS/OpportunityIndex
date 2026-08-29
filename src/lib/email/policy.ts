/**
 * Newsletter validation and policy.
 *
 * Pure and free of `server-only`, Supabase, and Kit, so the rules that decide
 * what is accepted can be tested directly.
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

/**
 * Signup sources the server will record.
 *
 * A closed allowlist rather than free text: `source` is caller-supplied, and
 * accepting arbitrary strings lets anyone write unbounded junk into a column
 * that later drives reporting.
 */
export const SUBSCRIBER_SOURCES = [
  "web",
  "footer",
  "sidebar",
  "newsletter-page",
  "opportunity-detail",
  "research",
] as const;

export type SubscriberSource = (typeof SUBSCRIBER_SOURCES)[number];

export const DEFAULT_SUBSCRIBER_SOURCE: SubscriberSource = "web";

/** Coerces an untrusted value to an allowed source, falling back to the default. */
export function normalizeSource(value: unknown): SubscriberSource {
  if (typeof value !== "string") return DEFAULT_SUBSCRIBER_SOURCE;
  const match = SUBSCRIBER_SOURCES.find((s) => s === value);
  return match ?? DEFAULT_SUBSCRIBER_SOURCE;
}

export function isAllowedSource(value: unknown): value is SubscriberSource {
  return typeof value === "string" && SUBSCRIBER_SOURCES.some((s) => s === value);
}
