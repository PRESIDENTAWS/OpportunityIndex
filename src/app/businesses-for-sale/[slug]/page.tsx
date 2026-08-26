import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Breadcrumbs, Card } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { getBusinessListing, getBusinessListingSlugs } from "@/lib/repository";
import { formatDate, money, plural } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getBusinessListingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getBusinessListing(slug);
  if (!listing) return { title: "Not found" };
  return {
    title: `${listing.name} — ${listing.location}`,
    description: `${listing.industry} business for sale in ${listing.location}. Asking ${money(listing.askingPrice)}.`,
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getBusinessListing(slug);
  if (!listing) notFound();

  const multiple = listing.cashFlowMultiple.toFixed(1);
  const margin = ((listing.cashFlow / listing.annualRevenue) * 100).toFixed(1);

  return (
    <>
      <header className="border-b py-8" style={{ borderColor: "var(--border)" }}>
        <div className="container-oi">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Businesses for Sale", href: "/businesses-for-sale" },
              { label: listing.name },
            ]}
          />
          <p className="mt-5 text-xs" style={{ color: "var(--fg-faint)" }}>
            {listing.industry} · {listing.location} · Established {listing.establishedYear}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-4xl">{listing.name}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Asking Price", money(listing.askingPrice)],
              ["Annual Revenue", money(listing.annualRevenue)],
              ["Seller Cash Flow", money(listing.cashFlow)],
              ["Multiple", `${multiple}x cash flow`],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <dt
                  className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                  style={{ color: "var(--fg-faint)" }}
                >
                  {label}
                </dt>
                <dd className="mt-1.5 font-semibold tabular-nums">{value}</dd>
              </Card>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <section>
            <h2 className="text-lg font-bold">Highlights</h2>
            <ul className="mt-3 space-y-2.5">
              {listing.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                  <Icon
                    name="badge"
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--score-fg)" }}
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold">The Numbers</h2>
            <dl
              className="mt-3 divide-y rounded-[var(--radius-brand)] border text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              {[
                ["Owner earnings margin", `${margin}% of revenue`],
                ["Employees", plural(listing.employeeCount, "person", "people")],
                ["Years established", `${new Date().getFullYear() - listing.establishedYear} years`],
                ["Owner financing", listing.ownerFinancing ? "Available" : "Not offered"],
                ["Reason for sale", listing.reasonForSale],
                ["Listing reviewed", formatDate(listing.reviewedAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-3">
                  <dt style={{ color: "var(--fg-muted)" }}>{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="my-8">
            <AdSlot format="in-content" />
          </div>

          <Card className="p-5">
            <h2 className="font-bold">Interested in this business?</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              Listings are supplied by brokers and owners. Verify every figure through
              your own due diligence before making an offer.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
              >
                Request details
              </Link>
              <Link
                href="/funding/sba-7a"
                className="rounded-[var(--radius-brand)] border px-5 py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Explore financing
              </Link>
            </div>
          </Card>
        </article>

        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.capitalRecon} />
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
