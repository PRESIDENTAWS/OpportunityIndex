"use client";

import { trackAffiliateClick } from "@/lib/analytics/client";

/**
 * An outbound affiliate link.
 *
 * Always points at `/api/go/<slug>`, never at a merchant URL directly. The
 * destination and its affiliate identifier live in the database, so the markup
 * cannot leak, alter, or fabricate a tracking parameter.
 */
export function AffiliateLink({
  linkSlug,
  program,
  opportunity,
  placement,
  children,
  className = "",
}: {
  linkSlug: string;
  /** Program slug, for the client-side analytics event only. */
  program: string;
  opportunity?: string | null;
  placement?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`/api/go/${encodeURIComponent(linkSlug)}`}
      // Affiliate destinations are third-party and commercial: tell crawlers so,
      // and do not hand the merchant our referrer window object.
      rel="sponsored noopener noreferrer"
      target="_blank"
      className={className}
      onClick={() => trackAffiliateClick({ program, opportunity, placement })}
    >
      {children}
    </a>
  );
}
