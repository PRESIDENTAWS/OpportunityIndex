import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Card, PageHeader } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { LISTINGS } from "@/data/listings";
import { money, moneyCompact, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Businesses for Sale",
  description:
    "Established businesses on the market, with asking price, revenue, cash flow, and owner-financing terms shown up front.",
};

export default function BusinessesForSalePage() {
  return (
    <>
      <PageHeader
        eyebrow="Acquisitions"
        title="Businesses for Sale"
        description="Cash flow on day one instead of a standing start. Every listing shows asking price against real revenue and owner earnings, so the multiple is never hidden."
      />

      <div className="container-oi grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="mb-4 text-sm" style={{ color: "var(--fg-faint)" }}>
            {plural(LISTINGS.length, "listing")}
          </p>

          <ul className="space-y-3">
            {LISTINGS.map((listing, index) => (
              <li key={listing.slug}>
                <Card as="article" className="p-5">
                  <Link href={`/businesses-for-sale/${listing.slug}`} className="block">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                          {listing.industry} · {listing.location} · Est. {listing.established}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">{listing.name}</h2>
                      </div>
                      {listing.ownerFinancing && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{ backgroundColor: "var(--score-bg)", color: "var(--score-fg)" }}
                        >
                          Owner financing
                        </span>
                      )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        ["Asking Price", money(listing.askingPrice)],
                        ["Revenue", moneyCompact(listing.revenue)],
                        ["Cash Flow", moneyCompact(listing.cashFlow)],
                        ["Multiple", `${(listing.askingPrice / listing.cashFlow).toFixed(1)}x`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt
                            className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                            style={{ color: "var(--fg-faint)" }}
                          >
                            {label}
                          </dt>
                          <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-4 flex items-center gap-1.5 text-sm" style={{ color: "var(--accent)" }}>
                      View listing
                      <Icon name="arrowRight" size={14} />
                    </p>
                  </Link>
                </Card>

                {(index + 1) % 3 === 0 && index + 1 < LISTINGS.length && (
                  <div className="pt-3">
                    <AdSlot format="in-content" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.dealflow} />
          <Card className="p-5">
            <h2 className="text-sm font-bold">Financing an acquisition</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              An SBA 7(a) loan can fund most of a purchase at roughly 10% down for
              qualified buyers.
            </p>
            <Link
              href="/funding/sba-7a"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              See the terms
              <Icon name="arrowRight" size={14} />
            </Link>
          </Card>
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
