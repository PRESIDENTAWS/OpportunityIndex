import Link from "next/link";
import { Icon } from "./Icon";

/**
 * The single funding CTA in the launch interface.
 *
 * Deliberately one placement, not a rail of them. It appears where capital is
 * already the reader's concern — beside startup costs on an opportunity page,
 * and under the matched results on the homepage — rather than on every screen.
 *
 * It makes no earnings claim and states no sponsorship. If this ever becomes a
 * paid placement it must carry a visible sponsored label and be disclosed, the
 * same as any other commercial placement on the site.
 */
export function CapitalReconCta({
  variant = "card",
  className = "",
}: {
  variant?: "card" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={`text-sm ${className}`} style={{ color: "var(--fg-muted)" }}>
        Short on startup capital?{" "}
        <Link href="/funding" className="font-medium underline underline-offset-4">
          Compare funding routes
        </Link>{" "}
        — rates, speed, and what you need to qualify.
      </p>
    );
  }

  return (
    <aside
      className={`rounded-[var(--radius-brand)] border p-5 ${className}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}
    >
      <p
        className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
        style={{ color: "var(--fg-faint)" }}
      >
        Capital Recon
      </p>
      <h2 className="mt-1.5 text-base font-semibold">
        Not enough capital for the option you want?
      </h2>
      <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
        Compare SBA loans, lines of credit, and equipment finance on rate, speed,
        and eligibility — so you know what is actually within reach.
      </p>
      <Link
        href="/funding"
        className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-brand)] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
      >
        Compare funding options
        <Icon name="arrowRight" size={15} />
      </Link>
    </aside>
  );
}
