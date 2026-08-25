import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Breadcrumbs, Card } from "@/components/PageShell";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { FUNDING } from "@/data/funding";
import { money } from "@/lib/format";

export function generateStaticParams() {
  return FUNDING.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = FUNDING.find((f) => f.slug === slug);
  if (!program) return { title: "Not found" };
  return { title: program.name, description: program.summary };
}

export default async function FundingProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = FUNDING.find((f) => f.slug === slug);
  if (!program) notFound();

  return (
    <>
      <header className="border-b py-8" style={{ borderColor: "var(--border)" }}>
        <div className="container-oi">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Funding", href: "/funding" },
              { label: program.name },
            ]}
          />
          <p className="mt-5 text-xs" style={{ color: "var(--fg-faint)" }}>
            {program.type}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-4xl">{program.name}</h1>
          <p className="mt-3 max-w-2xl" style={{ color: "var(--fg-muted)" }}>
            {program.summary}
          </p>
        </div>
      </header>

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <dl
            className="divide-y rounded-[var(--radius-brand)] border text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              ["Amount range", `${money(program.amount.min)} – ${money(program.amount.max)}`],
              ["Typical rate", program.typicalRate],
              ["Time to funding", program.speed],
              ["Minimum credit score", program.minCreditScore ? String(program.minCreditScore) : "Not score-based"],
              ["Time in business", program.timeInBusiness],
              ["Best for", program.bestFor],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt style={{ color: "var(--fg-muted)" }}>{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <h2 className="text-lg font-bold">What You Will Need</h2>
            <ul className="mt-3 space-y-2.5">
              {program.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                  <Icon
                    name="badge"
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--score-fg)" }}
                  />
                  {requirement}
                </li>
              ))}
            </ul>
          </section>

          <div className="my-8">
            <AdSlot format="in-content" />
          </div>

          <Card className="p-5">
            <h2 className="font-bold">Not financial advice</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              Rates and terms shown are typical market ranges, not offers, and they move
              with the underlying benchmark. Compare at least three lenders and read the
              full fee schedule before signing anything.
            </p>
            <Link
              href="/funding"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Compare all funding types
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
