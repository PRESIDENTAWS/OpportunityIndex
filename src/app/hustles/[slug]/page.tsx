import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Breadcrumbs, Card, SectionHeading } from "@/components/PageShell";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { SponsorCard, SPONSORS } from "@/components/SponsorCard";
import { OPPORTUNITIES } from "@/data/opportunities";
import { formatDate, hoursRange, moneyRange } from "@/lib/format";
import { categoryLabel, getOpportunity, relatedOpportunities } from "@/lib/queries";
import { scoreVerdict } from "@/lib/scoring";

export function generateStaticParams() {
  return OPPORTUNITIES.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const opportunity = getOpportunity((await params).slug);
  if (!opportunity) return { title: "Not found" };
  return {
    title: `${opportunity.name} — Score ${opportunity.score}`,
    description: opportunity.tagline,
  };
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = getOpportunity(slug);
  if (!opportunity) notFound();

  const related = relatedOpportunities(slug);
  const stats = [
    { label: "Startup Cost", value: moneyRange(opportunity.startupCost), icon: "bank" },
    { label: "Profit Potential / Month", value: moneyRange(opportunity.monthlyProfit), icon: "chart" },
    { label: "Time / Week", value: hoursRange(opportunity.hoursPerWeek), icon: "clock" },
    { label: "Flexibility", value: opportunity.flexibility, icon: "pin" },
  ];

  return (
    <>
      <header className="border-b py-8" style={{ borderColor: "var(--border)" }}>
        <div className="container-oi">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Hustles", href: "/hustles" },
              { label: categoryLabel(opportunity.category), href: `/businesses/${opportunity.category}` },
              { label: opportunity.name },
            ]}
          />

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <Icon name={opportunity.icon} size={28} />
              </span>
              <div>
                <p
                  className="text-[0.65rem] font-semibold tracking-eyebrow uppercase"
                  style={{ color: "var(--fg-faint)" }}
                >
                  {categoryLabel(opportunity.category)}
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-4xl">
                  {opportunity.name}
                </h1>
                <p className="mt-2 max-w-xl" style={{ color: "var(--fg-muted)" }}>
                  {opportunity.tagline}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                style={{ color: "var(--fg-faint)" }}
              >
                Overall Score
              </p>
              <ScoreBadge score={opportunity.score} size="lg" className="mt-1.5" />
              <p className="mt-2 max-w-[14rem] text-xs" style={{ color: "var(--fg-muted)" }}>
                {scoreVerdict(opportunity.score)}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <dt
                  className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-eyebrow uppercase"
                  style={{ color: "var(--fg-faint)" }}
                >
                  <Icon name={stat.icon} size={13} />
                  {stat.label}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold tabular-nums lg:text-base">
                  {stat.value}
                </dd>
              </Card>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <section>
            <h2 className="text-lg font-bold">The Opportunity</h2>
            <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {opportunity.summary}
            </p>
          </section>

          <div className="my-8">
            <AdSlot format="in-content" />
          </div>

          <section className="grid gap-6 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <Icon name="badge" size={17} style={{ color: "var(--score-fg)" }} />
                What Works
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                {opportunity.pros.map((pro) => (
                  <li key={pro} className="flex gap-2.5" style={{ color: "var(--fg-muted)" }}>
                    <span aria-hidden="true" style={{ color: "var(--score-fg)" }}>+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <Icon name="shield" size={17} style={{ color: "var(--fg-faint)" }} />
                What to Watch
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                {opportunity.cons.map((con) => (
                  <li key={con} className="flex gap-2.5" style={{ color: "var(--fg-muted)" }}>
                    <span aria-hidden="true" style={{ color: "var(--fg-faint)" }}>−</span>
                    {con}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold">How to Start</h2>
            <ol className="mt-4 space-y-4">
              {opportunity.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums"
                    style={{ backgroundColor: "var(--bg-inset)", color: "var(--fg)" }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold">Skills That Matter</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold">Common Tools</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {opportunity.tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <SectionHeading title="Compare With" action={{ label: "Compare tool", href: "/tools/compare" }} />
            <ul className="grid gap-3 sm:grid-cols-3">
              {related.map((other) => (
                <Card as="li" key={other.slug} className="p-4">
                  <Link href={`/hustles/${other.slug}`} className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold">{other.name}</span>
                      <span className="mt-1 block text-xs" style={{ color: "var(--fg-faint)" }}>
                        {categoryLabel(other.category)}
                      </span>
                    </span>
                    <ScoreBadge score={other.score} size="sm" />
                  </Link>
                </Card>
              ))}
            </ul>
          </section>
        </article>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Score Breakdown</h2>
            <p className="mt-1 mb-4 text-xs" style={{ color: "var(--fg-faint)" }}>
              Updated {formatDate(opportunity.updated)}
            </p>
            <ScoreBreakdown factors={opportunity.factors} />
            <Link
              href="/methodology"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              How scoring works
              <Icon name="arrowRight" size={13} />
            </Link>
          </Card>

          <SponsorCard sponsor={SPONSORS.capitalRecon} />
          <AdSlot format="half-page" className="hidden lg:flex" />
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
