import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * site.ts resolves the origin once at module scope, so each case has to reset
 * the module registry and re-import to pick up a different environment.
 */
async function loadWith(siteUrl: string | undefined) {
  vi.resetModules();
  if (siteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  }
  return import("@/lib/site");
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  vi.resetModules();
});

describe("SITE_URL", () => {
  it("uses the configured origin", async () => {
    const { SITE_URL } = await loadWith("https://sidehustleindex.com");
    expect(SITE_URL).toBe("https://sidehustleindex.com");
  });

  it("strips a trailing slash", async () => {
    const { SITE_URL } = await loadWith("https://sidehustleindex.com/");
    expect(SITE_URL).toBe("https://sidehustleindex.com");
  });

  it("strips a path, query, and fragment", async () => {
    const { SITE_URL } = await loadWith("https://sidehustleindex.com/app?a=1#b");
    expect(SITE_URL).toBe("https://sidehustleindex.com");
  });

  it("keeps the port for local development", async () => {
    const { SITE_URL } = await loadWith("http://localhost:3000");
    expect(SITE_URL).toBe("http://localhost:3000");
  });

  it.each([undefined, "", "   ", "not a url", "sidehustleindex.com", "javascript:alert(1)"])(
    "falls back to production rather than throwing for %j",
    async (value) => {
      const { SITE_URL } = await loadWith(value);
      expect(SITE_URL).toBe("https://sidehustleindex.com");
    },
  );

  it("always produces a value new URL() accepts, since metadataBase throws otherwise", async () => {
    const { SITE_URL } = await loadWith("://broken");
    expect(() => new URL(SITE_URL)).not.toThrow();
  });
});

describe("absoluteUrl", () => {
  it("joins a root-relative path without doubling the slash", async () => {
    const { absoluteUrl } = await loadWith("https://sidehustleindex.com");
    expect(absoluteUrl("/sitemap.xml")).toBe("https://sidehustleindex.com/sitemap.xml");
  });

  it("adds the missing leading slash", async () => {
    const { absoluteUrl } = await loadWith("https://sidehustleindex.com");
    expect(absoluteUrl("hustles")).toBe("https://sidehustleindex.com/hustles");
  });

  it("returns the bare origin for an empty path", async () => {
    const { absoluteUrl } = await loadWith("https://sidehustleindex.com");
    expect(absoluteUrl("")).toBe("https://sidehustleindex.com");
  });
});

describe("siteEmail", () => {
  it("does not follow the site origin, so local builds keep a real address", async () => {
    const { siteEmail } = await loadWith("http://localhost:3000");
    expect(siteEmail("privacy")).toBe("privacy@sidehustleindex.com");
  });
});

describe("SITE_DOMAIN", () => {
  it("is the host without the scheme", async () => {
    const { SITE_DOMAIN } = await loadWith("https://sidehustleindex.com");
    expect(SITE_DOMAIN).toBe("sidehustleindex.com");
  });
});
