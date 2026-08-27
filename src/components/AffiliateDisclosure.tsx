import Link from "next/link";

/**
 * Affiliate disclosure, shown near monetized links.
 *
 * Placed adjacent to the links it describes rather than buried in the footer,
 * so a reader encounters it at the moment it is relevant.
 */
export function AffiliateDisclosure({
  variant = "inline",
  className = "",
}: {
  variant?: "inline" | "block";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={`text-xs ${className}`} style={{ color: "var(--fg-faint)" }}>
        Some links here are affiliate links. If you sign up through one we may earn
        a commission, at no extra cost to you. It never affects a score or a
        ranking —{" "}
        <Link href="/methodology" className="underline underline-offset-4">
          see how we score
        </Link>
        .
      </p>
    );
  }

  return (
    <aside
      className={`rounded-[var(--radius-brand)] border p-4 ${className}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}
    >
      <h2
        className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
        style={{ color: "var(--fg-faint)" }}
      >
        Affiliate disclosure
      </h2>
      <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
        Some outbound links on this page are affiliate links, and we may earn a
        commission if you sign up through one — at no extra cost to you. Commercial
        relationships never influence a score, a rank, or inclusion in the index;
        no scoring factor references advertising. Read the{" "}
        <Link href="/methodology" className="underline underline-offset-4">
          methodology
        </Link>{" "}
        or the{" "}
        <Link href="/disclaimer" className="underline underline-offset-4">
          full disclaimer
        </Link>
        .
      </p>
    </aside>
  );
}
