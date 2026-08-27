import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  subscribe,
  type EmailProvider,
  type SubscriberStore,
} from "@/lib/email/subscribe";
import type { KitResult } from "@/lib/email/kit";
import { isAllowedSource, normalizeSource } from "@/lib/email/policy";

/**
 * Newsletter durability.
 *
 * The property under test: a visitor is never told "you're subscribed" unless a
 * record we own actually exists.
 */

/**
 * Builds a store whose methods are spies, so both behaviour and call shape can
 * be asserted. Typed through the real port so a drift in `SubscriberStore`
 * breaks these tests rather than silently passing.
 */
function makeStore(overrides: Partial<SubscriberStore> = {}) {
  const upsert = vi.fn<SubscriberStore["upsert"]>(
    overrides.upsert ?? (async () => true),
  );
  const attachProviderId = vi.fn<SubscriberStore["attachProviderId"]>(
    overrides.attachProviderId ?? (async () => {}),
  );
  return { upsert, attachProviderId };
}

function makeProvider(overrides: Partial<EmailProvider> = {}) {
  const isConfigured = vi.fn<EmailProvider["isConfigured"]>(
    overrides.isConfigured ?? (() => true),
  );
  const subscribe = vi.fn<EmailProvider["subscribe"]>(
    overrides.subscribe ??
      (async () => ({ ok: true, subscriberId: "kit-123" }) as KitResult),
  );
  return { isConfigured, subscribe };
}

const input = { email: "reader@example.com", consent: true, source: "footer" };

describe("subscribe — production durability", () => {
  it("fails when the local store write fails, and does not report success", async () => {
    const store = makeStore({ upsert: async () => false });
    const provider = makeProvider();

    const result = await subscribe(input, { store, provider, isProduction: true });

    expect(result).toEqual({ ok: false, reason: "storage-failed" });
  });

  it("does not call the provider when the local write failed", async () => {
    const store = makeStore({ upsert: async () => false });
    const provider = makeProvider();

    await subscribe(input, { store, provider, isProduction: true });

    // A subscriber that exists only in Kit cannot be reconciled or unsubscribed.
    expect(provider.subscribe).not.toHaveBeenCalled();
  });

  it("fails in production when no store is configured at all", async () => {
    const result = await subscribe(input, {
      store: null,
      provider: makeProvider(),
      isProduction: true,
    });

    expect(result).toEqual({ ok: false, reason: "storage-failed" });
  });

  it("writes locally before calling the provider", async () => {
    const order: string[] = [];
    const store = makeStore({
      upsert: async () => {
        order.push("store");
        return true;
      },
    });
    const provider = makeProvider({
      isConfigured: () => true,
      subscribe: async () => {
        order.push("provider");
        return { ok: true, subscriberId: "kit-1" } as KitResult;
      },
    });

    await subscribe(input, { store, provider, isProduction: true });

    expect(order).toEqual(["store", "provider"]);
  });
});

describe("subscribe — development fallback", () => {
  it("succeeds without a store in development only", async () => {
    const result = await subscribe(input, {
      store: null,
      provider: makeProvider({ isConfigured: () => false }),
      isProduction: false,
    });

    expect(result).toEqual({
      ok: true,
      storedLocally: false,
      forwardedToProvider: false,
    });
  });

  it("still fails in development when a configured store errors", async () => {
    // A present-but-erroring store is a real fault, not a missing credential.
    const result = await subscribe(input, {
      store: makeStore({ upsert: async () => false }),
      provider: makeProvider(),
      isProduction: false,
    });

    expect(result).toEqual({ ok: false, reason: "storage-failed" });
  });
});

describe("subscribe — provider id preservation", () => {
  it("attaches the provider id after a successful provider call", async () => {
    const store = makeStore();
    const provider = makeProvider({
      subscribe: async () => ({ ok: true, subscriberId: "kit-999" }) as KitResult,
    });

    await subscribe(input, { store, provider, isProduction: true });

    expect(store.attachProviderId).toHaveBeenCalledWith("reader@example.com", "kit-999");
  });

  it("never writes provider_subscriber_id during the initial upsert", async () => {
    const store = makeStore();

    await subscribe(input, { store, provider: makeProvider(), isProduction: true });

    // Including it in the upsert would null out an existing id on every signup.
    const [upsertArg] = store.upsert.mock.calls[0]!;
    expect(upsertArg).not.toHaveProperty("providerSubscriberId");
    expect(upsertArg).not.toHaveProperty("provider_subscriber_id");
  });

  it("preserves an existing provider id when the provider call fails", async () => {
    const store = makeStore();
    const provider = makeProvider({
      subscribe: async () => ({ ok: false, reason: "request-failed" }) as KitResult,
    });

    const result = await subscribe(input, { store, provider, isProduction: true });

    // No attach call means nothing overwrites what is already stored.
    expect(store.attachProviderId).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      storedLocally: true,
      forwardedToProvider: false,
    });
  });

  it("does not attach when the provider returns no subscriber id", async () => {
    const store = makeStore();
    const provider = makeProvider({
      subscribe: async () => ({ ok: true, subscriberId: null }) as KitResult,
    });

    await subscribe(input, { store, provider, isProduction: true });

    expect(store.attachProviderId).not.toHaveBeenCalled();
  });
});

describe("source allowlist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts known sources", () => {
    expect(isAllowedSource("footer")).toBe(true);
    expect(normalizeSource("newsletter-page")).toBe("newsletter-page");
  });

  it("falls back to the default for unknown or hostile values", () => {
    expect(normalizeSource("<script>alert(1)</script>")).toBe("web");
    expect(normalizeSource("x".repeat(10_000))).toBe("web");
    expect(normalizeSource(42)).toBe("web");
    expect(normalizeSource(null)).toBe("web");
    expect(normalizeSource(undefined)).toBe("web");
    expect(isAllowedSource("anything-else")).toBe(false);
  });

  it("records only the normalized source", async () => {
    const store = makeStore();

    await subscribe(
      { email: "a@b.co", consent: true, source: "not-on-the-list" },
      { store, provider: makeProvider({ isConfigured: () => false }), isProduction: true },
    );

    expect(store.upsert.mock.calls[0]![0]).toMatchObject({ source: "web" });
  });
});

describe("validation and consent", () => {
  it("rejects a malformed email before touching any dependency", async () => {
    const store = makeStore();
    const result = await subscribe(
      { email: "not-an-email", consent: true, source: "web" },
      { store, provider: makeProvider(), isProduction: true },
    );

    expect(result).toEqual({ ok: false, reason: "invalid-email" });
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("requires explicit consent", async () => {
    const store = makeStore();
    const result = await subscribe(
      { email: "reader@example.com", consent: false, source: "web" },
      { store, provider: makeProvider(), isProduction: true },
    );

    expect(result).toEqual({ ok: false, reason: "consent-required" });
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("normalizes case and whitespace before storing", async () => {
    const store = makeStore();
    await subscribe(
      { email: "  Reader@Example.COM  ", consent: true, source: "web" },
      { store, provider: makeProvider({ isConfigured: () => false }), isProduction: true },
    );

    expect(store.upsert.mock.calls[0]![0]).toMatchObject({ email: "reader@example.com" });
  });
});
