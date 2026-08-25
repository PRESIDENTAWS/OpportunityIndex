import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Card, PageHeader } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { FRANCHISES } from "@/data/franchises";
import { money, moneyRange, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Franchise Opportunities",
  description:
    "Franchise concepts with fees, total investment, royalties, and liquid capital requirements shown side by side.",
};

export default function FranchisesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Franchising"
        title="Franchise Opportunities"
        description="A proven system, a known brand, and a royalty for the privilege. Total investment is the number that matters — it usually runs several times the advertised franchise fee."
      />

      <div className="container-oi grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="mb-4 text-sm" style={{ color: "var(--fg-faint)" }}>
            {plural(FRANCHISES.length, "concept")}
          </p>

          <ul className="space-y-3">
            {FRANCHISES.map((franchise) => (
              <Card as="li" key={franchise.slug} className="p-5">
                <Link href={`/franchises/${franchise.slug}`} className="block">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                        {franchise.industry} · Founded {franchise.yearFounded}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">{franchise.name}</h2>
                    </div>
                    <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                      {franchise.units.toLocaleString("en-US")} units
                    </span>
                  </div>

                  <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                    {franchise.summary}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      ["Franchise Fee", money(franchise.franchiseFee)],
                      ["Total Investment", moneyRange(franchise.totalInvestment)],
                      ["Royalty", franchise.royalty],
                      ["Liquid Capital", money(franchise.liquidCapital)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt
                          className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                          style={{ color: "var(--fg-faint)" }}
                        >
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-4 flex items-center gap-1.5 text-sm" style={{ color: "var(--accent)" }}>
                    View concept
                    <Icon name="arrowRight" size={14} />
                  </p>
                </Link>
              </Card>
            ))}
          </ul>
        </div>

        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.capitalRecon} />
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
