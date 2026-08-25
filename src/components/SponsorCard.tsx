import Link from "next/link";

export interface Sponsor {
  eyebrow: string;
  brand: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}

export const SPONSORS: Record<string, Sponsor> = {
  capitalRecon: {
    eyebrow: "Featured Sponsor",
    brand: "CAPITAL RECON",
    title: "Fund Your Business With Confidence",
    body: "SBA Loans, DSCR Loans, Lines of Credit & More.",
    ctaLabel: "Get Pre-Qualified",
    href: "/funding",
  },
  dealflow: {
    eyebrow: "Sponsored",
    brand: "DEALFLOW MARKETPLACE",
    title: "Build. Grow. Exit.",
    body: "Find vetted businesses for sale with owner financing available.",
    ctaLabel: "Browse Deals",
    href: "/businesses-for-sale",
  },
};

/**
 * A paid placement. Rendered dark in both themes so it reads as distinct from
 * editorial content, and labelled as sponsored above the fold of the card.
 */
export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <aside className="rounded-[var(--radius-brand)]">
      <p
        className="mb-2 text-center text-[0.6rem] font-semibold tracking-eyebrow uppercase"
        style={{ color: "var(--fg-faint)" }}
      >
        {sponsor.eyebrow}
      </p>
      <div className="horizon-scene relative isolate overflow-hidden rounded-[var(--radius-brand)] p-5 text-white">
        <span className="horizon-beam opacity-60" aria-hidden="true" />
        <div className="relative z-10">
          <h2 className="text-lg leading-snug font-semibold">{sponsor.title}</h2>
          <p className="mt-2 text-sm text-white/70">{sponsor.body}</p>
          <Link
            href={sponsor.href}
            className="mt-4 inline-flex rounded-[var(--radius-brand)] bg-white px-4 py-2 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
          >
            {sponsor.ctaLabel}
          </Link>
          <p className="mt-4 text-right text-[0.65rem] font-semibold tracking-eyebrow text-white/60 uppercase">
            {sponsor.brand}
          </p>
        </div>
      </div>
    </aside>
  );
}
