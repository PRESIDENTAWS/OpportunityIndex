import { describe, expect, it } from "vitest";
import {
  buildRedirectUrl,
  checkDestination,
  deviceType,
  isLinkRedeemable,
  referrerHost,
} from "@/lib/monetization/affiliate-url";

/**
 * Redirect safety and UTM construction.
 *
 * These are the rules that decide whether an outbound redirect is safe and
 * whether a click can actually earn a commission, so they are tested directly
 * rather than through the route.
 */

describe("checkDestination — redirect safety", () => {
  it("accepts an absolute https URL", () => {
    const result = checkDestination("https://merchant.example.com/signup?irclickid=ABC");
    expect(result.ok).toBe(true);
  });

  it("rejects plaintext http, which would leak the affiliate id in transit", () => {
    const result = checkDestination("http://merchant.example.com/signup");
    expect(result).toEqual({ ok: false, reason: "not-https" });
  });

  it("rejects a relative path", () => {
    expect(checkDestination("/signup")).toEqual({ ok: false, reason: "not-absolute" });
  });

  it("rejects javascript: URLs", () => {
    expect(checkDestination("javascript:alert(1)")).toEqual({
      ok: false,
      reason: "not-https",
    });
  });

  it("rejects data: URLs", () => {
    expect(checkDestination("data:text/html,<script>alert(1)</script>")).toEqual({
      ok: false,
      reason: "not-https",
    });
  });

  it("rejects embedded credentials, which render deceptively", () => {
    expect(checkDestination("https://user:pass@evil.example.com")).toEqual({
      ok: false,
      reason: "credentials-in-url",
    });
  });

  it("rejects a protocol-relative URL", () => {
    expect(checkDestination("//evil.example.com")).toEqual({
      ok: false,
      reason: "not-absolute",
    });
  });

  it("rejects nonsense", () => {
    expect(checkDestination("not a url").ok).toBe(false);
  });
});

describe("isLinkRedeemable", () => {
  const base = {
    is_active: true,
    expires_at: null as string | null,
    program: { is_active: true },
  };

  it("is redeemable when link and program are both active", () => {
    expect(isLinkRedeemable(base as never)).toBe(true);
  });

  it("is not redeemable when the link is disabled", () => {
    expect(isLinkRedeemable({ ...base, is_active: false } as never)).toBe(false);
  });

  it("is not redeemable when the program is disabled", () => {
    expect(
      isLinkRedeemable({ ...base, program: { is_active: false } } as never),
    ).toBe(false);
  });

  it("is not redeemable after expiry", () => {
    const expired = { ...base, expires_at: "2020-01-01T00:00:00.000Z" };
    expect(isLinkRedeemable(expired as never)).toBe(false);
  });

  it("is redeemable before expiry", () => {
    const future = { ...base, expires_at: "2999-01-01T00:00:00.000Z" };
    expect(isLinkRedeemable(future as never)).toBe(true);
  });
});

describe("buildRedirectUrl — UTM construction", () => {
  const context = {
    programSlug: "acme",
    categorySlug: "online",
    opportunitySlug: "digital-product-creator",
  };

  it("appends the four standardized UTM parameters", () => {
    const url = buildRedirectUrl(new URL("https://merchant.example.com/signup"), context);
    expect(url.searchParams.get("utm_source")).toBe("acme");
    expect(url.searchParams.get("utm_medium")).toBe("affiliate");
    expect(url.searchParams.get("utm_campaign")).toBe("online");
    expect(url.searchParams.get("utm_content")).toBe("digital-product-creator");
  });

  it("preserves the real affiliate identifier untouched", () => {
    const url = buildRedirectUrl(
      new URL("https://merchant.example.com/signup?irclickid=REAL123&ref=partner7"),
      context,
    );
    // The affiliate id is what earns the commission — UTMs earn nothing.
    expect(url.searchParams.get("irclickid")).toBe("REAL123");
    expect(url.searchParams.get("ref")).toBe("partner7");
  });

  it("never overwrites a UTM the merchant already set", () => {
    const url = buildRedirectUrl(
      new URL("https://merchant.example.com/signup?utm_source=their-own-campaign"),
      context,
    );
    expect(url.searchParams.get("utm_source")).toBe("their-own-campaign");
    expect(url.searchParams.get("utm_medium")).toBe("affiliate");
  });

  it("omits UTMs with no value rather than emitting empty ones", () => {
    const url = buildRedirectUrl(new URL("https://merchant.example.com/signup"), {
      programSlug: "acme",
      categorySlug: null,
      opportunitySlug: null,
    });
    expect(url.searchParams.has("utm_campaign")).toBe(false);
    expect(url.searchParams.has("utm_content")).toBe(false);
    expect(url.searchParams.get("utm_source")).toBe("acme");
  });

  it("preserves host, path, and hash", () => {
    const url = buildRedirectUrl(
      new URL("https://merchant.example.com/deep/path#offer"),
      context,
    );
    expect(url.hostname).toBe("merchant.example.com");
    expect(url.pathname).toBe("/deep/path");
    expect(url.hash).toBe("#offer");
  });

  it("does not mutate the URL it was given", () => {
    const original = new URL("https://merchant.example.com/signup");
    buildRedirectUrl(original, context);
    expect(original.searchParams.has("utm_source")).toBe(false);
  });
});

describe("referrerHost", () => {
  it("keeps only the host, dropping any query string", () => {
    expect(referrerHost("https://news.example.com/article?token=secret")).toBe(
      "news.example.com",
    );
  });

  it("returns null for absent or unparseable referrers", () => {
    expect(referrerHost(null)).toBeNull();
    expect(referrerHost("garbage")).toBeNull();
  });
});

describe("deviceType", () => {
  it("buckets coarsely and returns null without a User-Agent", () => {
    expect(deviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148")).toBe(
      "mobile",
    );
    expect(deviceType("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(deviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("desktop");
    expect(deviceType("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe("bot");
    expect(deviceType(null)).toBeNull();
  });
});
