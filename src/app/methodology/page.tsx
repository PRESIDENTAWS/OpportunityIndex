import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import { countOpportunities, getScoringFactors } from "@/lib/repository";
import { PLANNED_DIMENSIONS } from "@/lib/scoring-model";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the Overall Score is calculated: six weighted factors, what each one measures, and what the numbers on this site are and are not.",
};

export default async function MethodologyPage() {
  const [total, factors] = await Promise.all([countOpportunities(), getScoringFactors()]);

  return (
    <>
      <PageHeader
        eyebrow="How we score"
        title="Methodology"
        description="Every opportunity on this site is scored the same way. Here is the whole formula, including its limits."
      />

      <div className="container-oi py-8">
        <Prose>
          <p>
            The Overall Score is a weighted blend of five factors, each rated
            0-100. Higher is always better for the operator, so a high
            &ldquo;Startup Affordability&rdquo; score means the business is
            <em> cheap</em> to start, not expensive.
          </p>

          <h2>The five scored factors</h2>
        </Prose>

        <ul className="mt-4 grid max-w-4xl gap-3 sm:grid-cols-2">
          {factors.map((factor) => (
            <Card as="li" key={factor.key} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{factor.label}</h3>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
                  {Math.round(factor.weight * 100)}%
                </span>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                {factor.description}
              </p>
            </Card>
          ))}
        </ul>

        <div className="mt-8">
          <Prose>
            <h2>What we do not yet score</h2>
            <p>
              Two dimensions belong in this model and are deliberately absent,
              because no opportunity record carries data that supports them. We
              would rather publish a five-factor score and say so than infer two
              more from fields that do not measure them:
            </p>
          </Prose>
        </div>

        <ul className="mt-4 grid max-w-4xl gap-3 sm:grid-cols-2">
          {PLANNED_DIMENSIONS.map((dimension) => (
            <Card as="li" key={dimension.label} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{dimension.label}</h3>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                  style={{ backgroundColor: "var(--bg-inset)", color: "var(--fg-muted)" }}
                >
                  Planned
                </span>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                {dimension.reason}
              </p>
            </Card>
          ))}
        </ul>

        <div className="mt-8">
          <Prose>
            <p>
              Both become scored factors once every opportunity carries a
              consistent editorial rating for them, and the weights are
              rebalanced in the same change. Until then they affect nothing.
            </p>

            <h2>The formula</h2>
            <p>
              Score = Σ (factor rating × factor weight), rounded to the nearest
              whole number. The five weights sum to exactly 1, so the result is
              always on a 0-100 scale. One definition produces the score in
              every list, card, and detail page — there is no separate editorial
              number, and no page can show a score that disagrees with the
              factors beneath it.
            </p>
            <p>
              Four of the five factors are rated directly on each opportunity.
              Flexibility is derived from where the work can be done:{" "}
              <strong>anywhere</strong> scores 100, <strong>remote</strong> 70,
              and <strong>local</strong> 30.
            </p>

            <h2>What the numbers are</h2>
            <p>
              Cost, profit, and time figures describe a typical solo operator in a
              mid-sized US market, drawn from public industry data, marketplace
              listings, and operator interviews. They are estimates of a realistic
              range, not averages of a survey and not projections for your situation.
            </p>

            <h2>What the numbers are not</h2>
            <ul>
              <li>
                They are not guarantees. Two people running the same model in the same
                city routinely see very different outcomes.
              </li>
              <li>
                They are not financial, legal, or tax advice. Licensing and insurance
                requirements in particular vary by state and by job.
              </li>
              <li>
                They are not a substitute for your own diligence, especially on
                acquisition listings and franchise disclosures.
              </li>
            </ul>

            <h2>Revisions</h2>
            <p>
              The index currently covers {total} models. Every opportunity page
              shows the date its factors were last reviewed. When a factor
              changes, the Overall Score changes with it — we do not
              retrospectively adjust scores to preserve a ranking.
            </p>

            <h2>Advertising and independence</h2>
            <p>
              Placements marked <em>Sponsored</em> or <em>Featured Sponsor</em> are paid.
              No sponsor can buy a score, a rank, or a place in the index, and no
              scoring factor accounts for whether a company advertises with us. See{" "}
              <Link href="/advertise" className="underline underline-offset-4">
                Advertise
              </Link>{" "}
              for how placements work.
            </p>
          </Prose>
        </div>
      </div>
    </>
  );
}
