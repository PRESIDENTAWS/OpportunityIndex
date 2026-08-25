import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import { allScored } from "@/lib/queries";
import { SCORE_FACTORS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the Overall Score is calculated: six weighted factors, what each one measures, and what the numbers on this site are and are not.",
};

export default function MethodologyPage() {
  const total = allScored().length;

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
            The Overall Score is a weighted blend of six factors, each rated 0-100.
            Higher is always better for the operator, so a high &ldquo;Low Startup
            Cost&rdquo; score means the business is cheap to start, and a high
            &ldquo;Competitive Room&rdquo; score means the field is not yet crowded.
          </p>

          <h2>The six factors</h2>
        </Prose>

        <ul className="mt-4 grid max-w-4xl gap-3 sm:grid-cols-2">
          {SCORE_FACTORS.map((factor) => (
            <Card as="li" key={factor.key} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{factor.label}</h3>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
                  {Math.round(factor.weight * 100)}%
                </span>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                {factor.meaning}
              </p>
            </Card>
          ))}
        </ul>

        <div className="mt-8">
          <Prose>
            <h2>The formula</h2>
            <p>
              Score = Σ (factor rating × factor weight), rounded to the nearest whole
              number. Weights sum to 1, so the result is always on a 0-100 scale. The
              same function produces the score in every list, card, and detail page on
              the site — there is no separate editorial number.
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
              The index currently covers {total} models and is revised quarterly. Every
              opportunity page shows the date its factors were last reviewed. When a
              factor changes, the Overall Score changes with it — we do not
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
