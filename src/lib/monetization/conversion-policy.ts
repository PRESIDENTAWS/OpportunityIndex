/**
 * Conversion lifecycle rules and payload safety.
 *
 * Pure and dependency-free so the rules that protect recorded revenue can be
 * tested directly.
 */

import type { ConversionStatus } from "./types";

/**
 * Permitted status transitions.
 *
 * The lifecycle only moves forward, with one exception: a reversal can happen
 * from any settled state (a refund can land after payout), and a reversal can
 * itself be reinstated when the merchant reinstates the commission.
 *
 * Nothing may return to `pending`. A network that re-sends an old `pending`
 * webhook after we have recorded `paid` must not be able to un-earn revenue.
 */
const ALLOWED_TRANSITIONS: Record<ConversionStatus, ConversionStatus[]> = {
  pending: ["approved", "reversed"],
  approved: ["paid", "reversed"],
  paid: ["reversed"],
  reversed: ["approved"],
};

export function isValidTransition(
  from: ConversionStatus,
  to: ConversionStatus,
): boolean {
  if (from === to) return true; // Idempotent re-delivery of the same state.
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** True when a transition would move a settled conversion backward. */
export function isBackwardTransition(
  from: ConversionStatus,
  to: ConversionStatus,
): boolean {
  return !isValidTransition(from, to);
}

/**
 * True when an incoming update is older than what we already hold.
 *
 * Webhooks arrive out of order and get replayed. Without this check a delayed
 * `pending` delivery can overwrite an `approved` record purely because it
 * arrived later.
 *
 * A missing incoming timestamp is treated as stale: an update that cannot prove
 * it is newer does not get to overwrite settled revenue.
 */
export function isStaleUpdate(
  storedStatusUpdatedAt: string | null,
  incomingStatusUpdatedAt: string | null,
): boolean {
  if (!incomingStatusUpdatedAt) return true;
  if (!storedStatusUpdatedAt) return false;

  const stored = Date.parse(storedStatusUpdatedAt);
  const incoming = Date.parse(incomingStatusUpdatedAt);
  if (Number.isNaN(incoming)) return true;
  if (Number.isNaN(stored)) return false;

  return incoming <= stored;
}

/** Largest webhook body worth reading. Anything larger is refused unparsed. */
export const MAX_WEBHOOK_BYTES = 64 * 1024;

export function isBodyTooLarge(
  body: string,
  max: number = MAX_WEBHOOK_BYTES,
): boolean {
  return Buffer.byteLength(body, "utf8") > max;
}

export type ParsedBody =
  | { ok: true; value: unknown }
  | { ok: false; reason: "malformed-json" };

/** Parses a body without throwing, so a bad payload cannot become a 500. */
export function safeJsonParse(body: string): ParsedBody {
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, reason: "malformed-json" };
  }
}

/**
 * Keys allowed to survive into stored payloads.
 *
 * Affiliate webhooks routinely carry customer email addresses, names, shipping
 * addresses, and IPs. None of that is needed to reconcile a commission, and
 * storing it would put customer PII belonging to a third party into our
 * database. Everything outside this allowlist is dropped.
 */
const SAFE_PAYLOAD_KEYS = new Set([
  "id",
  "conversion_id",
  "action_id",
  "order_id",
  "order_reference",
  "status",
  "state",
  "currency",
  "amount",
  "sale_amount",
  "commission",
  "commission_amount",
  "payout",
  "program",
  "program_id",
  "campaign",
  "campaign_id",
  "merchant",
  "advertiser",
  "click_id",
  "created_at",
  "updated_at",
  "occurred_at",
  "event_date",
  "locking_date",
]);

/** Keys that must never survive, even if they appear inside a nested object. */
const FORBIDDEN_KEY_PATTERN =
  /email|e_mail|name|phone|address|street|city|zip|postal|ip\b|ip_address|customer|consumer|user_agent|token|secret|password/i;

/**
 * Reduces a webhook payload to a non-identifying subset.
 *
 * Recurses one level into plain objects so nested amount blocks survive, drops
 * anything matching a PII-shaped key, and truncates long strings.
 */
export function redactPayload(payload: unknown, depth = 0): Record<string, unknown> {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) continue;
    if (!SAFE_PAYLOAD_KEYS.has(key.toLowerCase())) continue;

    if (typeof value === "string") {
      output[key] = value.length > 256 ? `${value.slice(0, 256)}…` : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      output[key] = value;
    } else if (value && typeof value === "object" && depth < 2) {
      output[key] = redactPayload(value, depth + 1);
    }
  }

  return output;
}
