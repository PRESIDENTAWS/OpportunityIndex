import { describe, expect, it } from "vitest";
import {
  isBodyTooLarge,
  isStaleUpdate,
  isValidTransition,
  MAX_WEBHOOK_BYTES,
  redactPayload,
  safeJsonParse,
} from "@/lib/monetization/conversion-policy";

/**
 * Conversion integrity.
 *
 * The property under test: a replayed, stale, or hostile webhook cannot corrupt
 * revenue we have already recorded.
 */

describe("status transitions", () => {
  it("allows the forward lifecycle", () => {
    expect(isValidTransition("pending", "approved")).toBe(true);
    expect(isValidTransition("approved", "paid")).toBe(true);
  });

  it("allows reversal from any settled state", () => {
    expect(isValidTransition("pending", "reversed")).toBe(true);
    expect(isValidTransition("approved", "reversed")).toBe(true);
    // A refund can land after payout.
    expect(isValidTransition("paid", "reversed")).toBe(true);
  });

  it("allows a reversal to be reinstated", () => {
    expect(isValidTransition("reversed", "approved")).toBe(true);
  });

  it("never moves backward to pending", () => {
    // A replayed old `pending` webhook must not un-earn recorded revenue.
    expect(isValidTransition("approved", "pending")).toBe(false);
    expect(isValidTransition("paid", "pending")).toBe(false);
    expect(isValidTransition("reversed", "pending")).toBe(false);
  });

  it("never demotes paid back to approved", () => {
    expect(isValidTransition("paid", "approved")).toBe(false);
  });

  it("treats an identical status as valid and idempotent", () => {
    for (const status of ["pending", "approved", "paid", "reversed"] as const) {
      expect(isValidTransition(status, status)).toBe(true);
    }
  });
});

describe("stale update detection", () => {
  const older = "2026-01-01T00:00:00.000Z";
  const newer = "2026-06-01T00:00:00.000Z";

  it("rejects an update older than what is stored", () => {
    expect(isStaleUpdate(newer, older)).toBe(true);
  });

  it("rejects an update with the same timestamp", () => {
    expect(isStaleUpdate(newer, newer)).toBe(true);
  });

  it("accepts a strictly newer update", () => {
    expect(isStaleUpdate(older, newer)).toBe(false);
  });

  it("treats a missing incoming timestamp as stale", () => {
    // An update that cannot prove it is newer does not overwrite settled revenue.
    expect(isStaleUpdate(newer, null)).toBe(true);
  });

  it("treats an unparseable incoming timestamp as stale", () => {
    expect(isStaleUpdate(newer, "not-a-date")).toBe(true);
  });

  it("accepts any valid update when nothing is stored", () => {
    expect(isStaleUpdate(null, newer)).toBe(false);
  });
});

describe("webhook body limits", () => {
  it("accepts a normal payload", () => {
    expect(isBodyTooLarge(JSON.stringify({ id: "1", amount: 100 }))).toBe(false);
  });

  it("rejects a payload over the cap", () => {
    expect(isBodyTooLarge("x".repeat(MAX_WEBHOOK_BYTES + 1))).toBe(true);
  });

  it("measures bytes, not characters", () => {
    // Multi-byte characters must not slip past a length-based check.
    const multibyte = "€".repeat(MAX_WEBHOOK_BYTES / 2);
    expect(multibyte.length).toBeLessThanOrEqual(MAX_WEBHOOK_BYTES);
    expect(isBodyTooLarge(multibyte)).toBe(true);
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
  });

  it("returns a failure rather than throwing on malformed JSON", () => {
    // This is what keeps a bad payload from becoming an unhandled 500.
    expect(safeJsonParse("{not json")).toEqual({ ok: false, reason: "malformed-json" });
    expect(safeJsonParse("")).toEqual({ ok: false, reason: "malformed-json" });
    expect(safeJsonParse("undefined")).toEqual({ ok: false, reason: "malformed-json" });
  });
});

describe("payload redaction", () => {
  const payload = {
    id: "CONV-1",
    order_id: "ORD-9",
    status: "approved",
    amount: 12999,
    commission: 1039,
    currency: "USD",
    // All of the following are customer PII and must not be stored.
    customer_email: "buyer@example.com",
    email: "buyer@example.com",
    customer_name: "A Buyer",
    shipping_address: "1 Example Street",
    ip_address: "203.0.113.4",
    phone: "+15550100",
    user_agent: "Mozilla/5.0",
  };

  it("keeps the fields needed to reconcile a commission", () => {
    const redacted = redactPayload(payload);
    expect(redacted).toMatchObject({
      id: "CONV-1",
      order_id: "ORD-9",
      status: "approved",
      amount: 12999,
      commission: 1039,
      currency: "USD",
    });
  });

  it("drops every PII field", () => {
    const redacted = redactPayload(payload);
    for (const key of [
      "customer_email",
      "email",
      "customer_name",
      "shipping_address",
      "ip_address",
      "phone",
      "user_agent",
    ]) {
      expect(redacted).not.toHaveProperty(key);
    }
    expect(JSON.stringify(redacted)).not.toContain("buyer@example.com");
    expect(JSON.stringify(redacted)).not.toContain("203.0.113.4");
  });

  it("drops unrecognised keys rather than passing them through", () => {
    const redacted = redactPayload({ id: "1", surprise_field: "anything" });
    expect(redacted).toHaveProperty("id");
    expect(redacted).not.toHaveProperty("surprise_field");
  });

  it("truncates long strings", () => {
    const redacted = redactPayload({ order_reference: "x".repeat(1000) });
    expect((redacted.order_reference as string).length).toBeLessThanOrEqual(257);
  });

  it("returns an empty object for non-objects", () => {
    expect(redactPayload(null)).toEqual({});
    expect(redactPayload("a string")).toEqual({});
    expect(redactPayload([1, 2, 3])).toEqual({});
  });
});
