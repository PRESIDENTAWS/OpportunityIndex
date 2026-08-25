import Link from "next/link";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { FilterRail } from "@/components/FilterRail";
import { HorizonCard } from "@/components/HorizonCard";
import { Icon } from "@/components/Icon";
import { MobileFilterButton } from "@/components/MobileFilterButton";
import { NewsletterCard } from "@/components/NewsletterCard";
import { OpportunityTable } from "@/components/OpportunityTable";
import { Card, SectionHeading } from "@/components/PageShell";
import { SortSelect } from "@/components/SortSelect";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { LISTINGS } from "@/data/listings";
import { RESEARCH } from "@/data/research";
import { moneyCompact, plural } from "@/lib/format";
import { CATEGORY_TABS } from "@/lib/nav";
import { allScored, filterOpportunities } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";
import { parseFilters } from "@/lib/params";

const WHY = [
  {
    icon: "scale",
    title: "Compare Everything",
    body: "Side hustles, businesses, and franchises scored side by side on one scale.",
  },
  {
    icon: "shield",
    title: "Data You Can Trust",
    body: "Six published factors, one transparent formula, revised every quarter.",
  },
  {
    icon: "pencil",
    title: "Make Smarter Moves",
    body: "From first idea to funding, every step has a worked example behind it.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const results = filterOpportunities(filters);
  const total = allScored().length;
  const featured = results.slice(0, 7);
  const isFiltered = results.length !== total;

  return (
    <>
      {/* One grid for the whole upper page, so the sponsor rail runs beside the
          hero and the index rather than stretching a single short row. */}
      <div className="container-oi grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl leading-[1.08] font-bold tracking-tight lg:text-5xl">
            Discover <span style={{ color: "var(--accent)" }}>Opportunities.</span>
            <br />
            Build Freedom.
          </h1>
          <p className="mt-4 max-w-md text-base lg:text-lg" style={{ color: "var(--fg-muted)" }}>
            The independent platform to discover, evaluate, and compare side
            hustles, businesses, and acquisition opportunities.
          </p>
          <Link
            href="/hustles"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-[var(--radius-brand)] px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
          >
            Explore Opportunities
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        <HorizonCard
          title="Your next move starts with insight."
          ctaLabel="How It Works"
          ctaHref="/methodology"
          minHeight="17rem"
        />

      </section>

      {/* Category shortcuts — the mobile mockup's tile grid, kept on desktop as a rail */}
      <nav aria-label="Sections" className="mt-8">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CATEGORY_TABS.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-brand)] border px-2 py-4 text-center text-xs font-medium transition-colors hover:border-[var(--border-strong)]"
                style={{ borderColor: "var(--border)" }}
              >
                <Icon name={tab.icon} size={22} style={{ color: "var(--accent)" }} />
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <AdSlot format="in-content" />
      </div>

      {/* Index */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside
          className="hidden self-start rounded-[var(--radius-brand)] border p-4 lg:block"
          style={{ borderColor: "var(--border)" }}
        >
          <Suspense fallback={null}>
            <FilterRail />
          </Suspense>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionHeading
              title={isFiltered ? "Matching Opportunities" : "Top Opportunities This Week"}
            />
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
              <span className="hidden text-sm sm:block" style={{ color: "var(--fg-faint)" }}>
                {plural(results.length, "opportunity", "opportunities")} found
              </span>
              <Suspense fallback={null}>
                <MobileFilterButton />
                <SortSelect />
              </Suspense>
            </div>
          </div>

          <OpportunityTable opportunities={featured} adEvery={5} compact />

          <Link
            href="/hustles"
            className="mt-4 flex items-center justify-center gap-2 rounded-[var(--radius-brand)] border py-3 text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}
          >
            View all {total} opportunities
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </section>
        </div>

        {/* Sponsor rail — beside the content on wide screens, beneath it below xl */}
        <aside className="space-y-4">
          <SponsorCard sponsor={SPONSORS.capitalRecon} />
          <AdSlot format="half-page" className="hidden xl:flex" />
          <SponsorCard sponsor={SPONSORS.dealflow} />
          <NewsletterCard />
        </aside>
      </div>

      {/* Why */}
      <section className="container-oi mt-14">
        <SectionHeading title="Why Use Opportunity Index?" />
        <ul className="grid gap-4 sm:grid-cols-3">
          {WHY.map((item) => (
            <Card as="li" key={item.title} className="p-5">
              <Icon name={item.icon} size={26} style={{ color: "var(--accent)" }} />
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                {item.body}
              </p>
            </Card>
          ))}
        </ul>
      </section>

      {/* Browse by category */}
      <section className="container-oi mt-14">
        <SectionHeading title="Browse by Category" action={{ label: "All categories", href: "/businesses" }} />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const inCategory = allScored().filter((o) => o.category === category.slug);
            const best = inCategory[0];
            return (
              <Card as="li" key={category.slug} className="p-4">
                <Link href={`/businesses/${category.slug}`} className="block">
                  <h3 className="font-semibold">{category.label}</h3>
                  <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>
                    {plural(inCategory.length, "model")}
                  </p>
                  {best && (
                    <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
                      Top: {best.name}
                    </p>
                  )}
                </Link>
              </Card>
            );
          })}
        </ul>
      </section>

      {/* Businesses for sale */}
      <section className="container-oi mt-14">
        <SectionHeading
          title="Businesses for Sale"
          action={{ label: "All listings", href: "/businesses-for-sale" }}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LISTINGS.slice(0, 3).map((listing) => (
            <Card as="li" key={listing.slug} className="p-5">
              <Link href={`/businesses-for-sale/${listing.slug}`} className="block">
                <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                  {listing.industry} · {listing.location}
                </p>
                <h3 className="mt-1 font-semibold">{listing.name}</h3>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["Asking", moneyCompact(listing.askingPrice)],
                    ["Revenue", moneyCompact(listing.revenue)],
                    ["Cash Flow", moneyCompact(listing.cashFlow)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt style={{ color: "var(--fg-faint)" }}>{label}</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Link>
            </Card>
          ))}
        </ul>
      </section>

      {/* Research */}
      <section className="container-oi mt-14">
        <SectionHeading title="Latest Research" action={{ label: "All research", href: "/research" }} />
        <ul className="grid gap-3 sm:grid-cols-3">
          {RESEARCH.slice(0, 3).map((piece) => (
            <Card as="li" key={piece.slug} className="p-5">
              <Link href={`/research/${piece.slug}`} className="block">
                <p
                  className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  {piece.kind} · {piece.readingTime} min read
                </p>
                <h3 className="mt-2 font-semibold">{piece.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                  {piece.excerpt}
                </p>
              </Link>
            </Card>
          ))}
        </ul>
      </section>

      <div className="container-oi mt-14">
        <AdSlot format="leaderboard" note="Footer Leaderboard" />
      </div>
    </>
  );
}
