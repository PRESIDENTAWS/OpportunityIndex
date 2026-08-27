import { afterEach, describe, expect, it } from "vitest";
import { getAdapter, listAdapters } from "@/lib/monetization/adapters";
import { ConversionParseError } from "@/lib/monetization/adapters/types";

/**
 * Unfinished adapters stay disabled.
 *
 * The property under test: no environment change can activate an adapter whose
 * parse() still throws. Only a code change can.
 */

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe.each(["impact", "refersion"])("%s adapter", (network) => {
  const secretVar =
    network === "impact" ? "IMPACT_WEBHOOK_SECRET" : "REFERSION_WEBHOOK_SECRET";

  it("is not configured with no secret present", () => {
    delete process.env[secretVar];
    expect(getAdapter(network)!.isConfigured()).toBe(false);
  });

  it("remains not configured even when the secret IS present", () => {
    // This is the whole point: a secret alone must not activate an adapter
    // whose parse() throws, or the route would accept a signed request and
    // then fail after treating the integration as live.
    process.env[secretVar] = "a-real-looking-secret-value";
    expect(getAdapter(network)!.isConfigured()).toBe(false);
  });

  it("throws a typed parse error rather than returning fabricated data", () => {
    const adapter = getAdapter(network)!;
    expect(() => adapter.parse("{}")).toThrow(ConversionParseError);
  });

  it("refuses to verify a signature when unconfigured", async () => {
    delete process.env[secretVar];
    const adapter = getAdapter(network)!;
    const verified = await adapter.verifySignature({
      rawBody: "{}",
      headers: new Headers(),
    });
    expect(verified).toBe(false);
  });

  it("refuses to verify when the signature header is missing", async () => {
    process.env[secretVar] = "secret";
    const adapter = getAdapter(network)!;
    const verified = await adapter.verifySignature({
      rawBody: "{}",
      headers: new Headers(),
    });
    expect(verified).toBe(false);
  });

  it("refuses a wrong signature without throwing", async () => {
    process.env[secretVar] = "secret";
    const adapter = getAdapter(network)!;
    const headers = new Headers({
      [`x-${network}-signature`]: "deadbeef",
    });
    await expect(
      adapter.verifySignature({ rawBody: "{}", headers }),
    ).resolves.toBe(false);
  });
});

describe("adapter registry", () => {
  it("reports every adapter as unconfigured, secrets or not", () => {
    process.env.IMPACT_WEBHOOK_SECRET = "x";
    process.env.REFERSION_WEBHOOK_SECRET = "y";
    expect(listAdapters()).toEqual([
      { network: "impact", configured: false },
      { network: "refersion", configured: false },
    ]);
  });

  it("returns undefined for an unknown network", () => {
    expect(getAdapter("not-a-network")).toBeUndefined();
  });
});
