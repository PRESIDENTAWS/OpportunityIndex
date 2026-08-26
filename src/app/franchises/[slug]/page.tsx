import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Breadcrumbs, Card } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { getFranchise, getFranchiseSlugs } from "@/lib/repository";
import { formatDate, money, moneyRange } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getFranchiseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const franchise = await getFranchise(slug);
  if (!franchise) return { title: "Not found" };
  return { title: franchise.name, description: franchise.summary };
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const franchise = await getFranchise(slug);
  if (!franchise) notFound();

  return (
    <>
      <header className="border-b py-8" style={{ borderColor: "var(--border)" }}>
        <div className="container-oi">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Franchises", href: "/franchises" },
              { label: franchise.name },
            ]}
          />
          <p className="mt-5 text-xs" style={{ color: "var(--fg-faint)" }}>
            {franchise.industry} · Founded {franchise.foundedYear} ·{" "}
            {franchise.unitCount.toLocaleString("en-US")} units
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-4xl">{franchise.name}</h1>
          <p className="mt-3 max-w-2xl" style={{ color: "var(--fg-muted)" }}>
            {franchise.summary}
          </p>
        </div>
      </header>

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <h2 className="text-lg font-bold">Investment Requirements</h2>
          <dl
            className="mt-3 divide-y rounded-[var(--radius-brand)] border text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              ["Franchise fee", money(franchise.franchiseFee)],
              ["Total investment", moneyRange(franchise.totalInvestment)],
              ["Ongoing royalty", franchise.royalty],
              ["Liquid capital required", money(franchise.liquidCapitalRequired)],
              ["Units in system", franchise.unitCount.toLocaleString("en-US")],
              ["Data reviewed", formatDate(franchise.reviewedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt style={{ color: "var(--fg-muted)" }}>{label}</dt>
                <dd className="text-right font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <h2 className="text-lg font-bold">What the Franchisor Provides</h2>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {franchise.support.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                  <Icon
                    name="badge"
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--score-fg)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="my-8">
            <AdSlot format="in-content" />
          </div>

          <Card className="p-5">
            <h2 className="font-bold">Before you sign</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              Ask for the Franchise Disclosure Document and read Item 19 carefully — it
              is where actual unit performance is disclosed, or conspicuously is not.
              Speak to at least five current franchisees before committing capital.
            </p>
            <Link
              href="/research/franchise-fee-reality-check"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Read: what franchise fees actually buy you
              <Icon name="arrowRight" size={14} />
            </Link>
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
