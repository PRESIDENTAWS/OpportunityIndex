/**
 * Single source of truth for the site's public origin and contact addresses.
 *
 * Everything that needs an absolute URL — canonical tags, Open Graph, robots,
 * sitemap — reads from here, so changing domains is one environment variable
 * rather than an edit across six files.
 */

/** Used when NEXT_PUBLIC_SITE_URL is unset or unusable. */
const FALLBACK_ORIGIN = "https://sidehustleindex.com";

/**
 * The mail domain. Deliberately NOT derived from the site origin: in
 * development that origin is http://localhost:3000, and `privacy@localhost:3000`
 * is not an address anyone can write to.
 */
export const EMAIL_DOMAIN = "sidehustleindex.com";

/**
 * Normalises NEXT_PUBLIC_SITE_URL to a bare origin — no trailing slash, no
 * path, no query. `new URL(...).origin` does that for us and rejects malformed
 * values, which matters because `metadataBase` throws on an invalid URL and
 * would take the whole build down.
 */
function resolveOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_ORIGIN;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return FALLBACK_ORIGIN;
    }
    return url.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

/** Absolute origin, no trailing slash. e.g. `https://sidehustleindex.com` */
export const SITE_URL = resolveOrigin();

/** Host only, for display in copy. e.g. `sidehustleindex.com` */
export const SITE_DOMAIN = new URL(SITE_URL).host;

/** `siteEmail("privacy")` → `privacy@sidehustleindex.com` */
export function siteEmail(mailbox: string): string {
  return `${mailbox}@${EMAIL_DOMAIN}`;
}

/** Joins a root-relative path onto the origin. `absoluteUrl("/hustles")` */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}
