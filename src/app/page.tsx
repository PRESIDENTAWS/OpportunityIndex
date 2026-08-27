import Link from "next/link";
import { CapitalReconCta } from "@/components/CapitalReconCta";
import { HorizonCard } from "@/components/HorizonCard";
import { Icon } from "@/components/Icon";
import { MatchForm } from "@/components/MatchForm";
import { MatchResults } from "@/components/MatchResults";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Card, SectionHeading } from "@/components/PageShell";
import { ScoreBadge } from "@/components/ScoreBadge";
import { hoursRange, moneyRange, plural } from "@/lib/format";
import {
  hasMatchInput,
  matchOpportunities,
  parseMatchInput,
} from "@/lib/matching";
import { countOpportunities, getScoringFactors, listOpportunities } from "@/lib/repository";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const matchInput = parseMatchInput(params);
  const submitted = hasMatchInput(params);

  const [opportunities, total, scoringFactors] = await Promise.all([
    listOpportunities(),
    countOpportunities(),
    getScoringFactors(),
  ]);

  const matches = submitted ? matchOpportunities(opportunities, matchInput).slice(0, 5) : [];
  const featured = opportunities.slice(0, 5);

  return (
    <>
      {/* Hero + matching form */}
      <section className="container-oi py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div>
            <h1 className="text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find the right opportunity for your{" "}
              <span style={{ color: "var(--accent)" }}>money, time, and goals.</span>
            </h1>
            <p className="mt-4 max-w-md text-base" style={{ color: "var(--fg-muted)" }}>
              Tell us what you have to work with. We rank every opportunity in the
              index against your capital, your hours, and the income you are aiming
              for — and show you exactly why each one placed where it did.
            </p>

            <ul className="mt-6 space-y-2.5">
              {[
                "Scored on five published factors, weights and all",
                "No sign-up, no paywall, no invented statistics",
                `${plural(total, "opportunity", "opportunities")} reviewed and dated`,
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm">
                  <Icon
                    name="badge"
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--score-fg)" }}
                  />
                  <span style={{ color: "var(--fg-muted)" }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <MatchForm initial={submitted ? matchInput : undefined} />
        </div>
      </section>

      {/* Ranked matches */}
      {submitted && (
        <section id="results" className="container-oi scroll-mt-24 pb-4">
          <SectionHeading
            title="Your top matches"
            count={
              matches.length > 0
                ? `${plural(matches.length, "result")} of ${total}`
                : undefined
            }
            action={{ label: "Browse all", href: "/hustles" }}
          />
          <MatchResults results={matches} />

          {matches.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-start">
              <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
                <strong>Match</strong> is how well an opportunity fits the capital,
                hours, and income goal you entered — 40% capital, 25% time, 35%
                income. <strong>Score</strong> is how strong the opportunity is in
                general, independent of you. They are kept separate on purpose: a
                great opportunity can still be a poor fit.
              </p>
              <CapitalReconCta variant="card" />
            </div>
          )}
        </section>
      )}

      {/* Featured */}
      <section className="container-oi mt-10">
        <SectionHeading
          title={submitted ? "Also worth a look" : "Top-scoring opportunities"}
          action={{ label: "See all", href: "/hustles" }}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {featured.map((o) => (
            <Card as="li" key={o.slug} className="p-4">
              <Link href={`/hustles/${o.slug}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border"
                    style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                  >
                    <Icon name={o.icon} size={18} />
                  </span>
                  <ScoreBadge score={o.score} size="sm" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{o.name}</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                  {o.tagline}
                </p>
                <p
                  className="mt-2.5 text-xs tabular-nums"
                  style={{ color: "var(--fg-faint)" }}
                >
                  {moneyRange(o.startupCost)} · {hoursRange(o.hoursPerWeek)}
                </p>
              </Link>
            </Card>
          ))}
        </ul>
      </section>

      {/* How scoring works */}
      <section className="container-oi mt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div>
            <SectionHeading title="How the Opportunity Score works" />
            <p className="max-w-xl text-sm" style={{ color: "var(--fg-muted)" }}>
              Every opportunity is rated 0-100 on five factors and blended with the
              weights below. Higher is always better for the operator, so a high
              Startup Affordability means it is <em>cheap</em> to start. The score is
              computed in one place, so no page can show a number that disagrees with
              the factors beneath it.
            </p>

            <ul className="mt-5 space-y-2.5">
              {scoringFactors.map((factor) => (
                <li key={factor.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{factor.label}</span>
                    <span className="tabular-nums" style={{ color: "var(--fg-muted)" }}>
                      {(factor.weight * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--bg-inset)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${factor.weight * 100 * 3}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/methodology"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Read the full methodology, including what we do not yet score
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>

          <HorizonCard
            title="Fewer opinions. More arithmetic."
            body="Published weights, a date on every figure, and no score anyone can buy."
            ctaLabel="How we score"
            ctaHref="/methodology"
            minHeight="17rem"
          />
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-oi mt-14">
        <Card className="p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Get new opportunities by email</h2>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                One email a week: what was added, what was re-scored, and why. No
                course pitches.
              </p>
            </div>
            <NewsletterForm layout="stacked" source="web" />
          </div>
        </Card>
      </section>
    </>
  );
}
