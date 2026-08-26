import type { Metadata } from "next";
import Link from "next/link";
import { HorizonCard } from "@/components/HorizonCard";
import { Card, PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import {
  countOpportunities,
  listBusinessListings,
  listFranchises,
  listFundingPrograms,
  listResearchPieces,
} from "@/lib/repository";

export const metadata: Metadata = {
  title: "About",
  description:
    "Opportunity Index is an independent index of side hustles, businesses, franchises, and acquisitions — all scored on one transparent scale.",
};

export default async function AboutPage() {
  // Counts are derived from the data, never hard-coded — see PRODUCT_SPEC.md.
  const [opportunities, listings, franchises, funding, research] = await Promise.all([
    countOpportunities(),
    listBusinessListings(),
    listFranchises(),
    listFundingPrograms(),
    listResearchPieces(),
  ]);

  const stats = [
    ["Business models", opportunities],
    ["Businesses for sale", listings.length],
    ["Franchise concepts", franchises.length],
    ["Funding routes", funding.length],
    ["Research pieces", research.length],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Find. Evaluate. Build. Grow."
        description="Most advice about starting a business is either a sales pitch or a story. We wanted the boring version: the same questions asked of every opportunity, answered the same way, so they can actually be compared."
      />

      <div className="container-oi py-8">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {stats.map(([label, value]) => (
            <Card as="li" key={label} className="p-4">
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>
                {label}
              </p>
            </Card>
          ))}
        </ul>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Prose>
            <h2>Why an index</h2>
            <p>
              A side hustle listicle tells you a cleaning business is a good idea. It
              does not tell you how it compares to a bookkeeping practice on the things
              that decide whether you stick with it: what it costs, how long before
              someone pays you, and whether growing means working more hours.
            </p>
            <p>
              So we score every opportunity on the same six factors and publish the
              weights. You can disagree with the weights — that is the point of showing
              them.
            </p>

            <h2>How we stay independent</h2>
            <p>
              The site carries advertising and sponsored placements, all labelled. None
              of them influence a score or a ranking, and no scoring factor considers
              whether a company advertises with us. The full scoring model is published
              on the{" "}
              <Link href="/methodology" className="underline underline-offset-4">
                methodology page
              </Link>
              .
            </p>

            <h2>What is here today</h2>
            <p>
              The index covers business models, acquisition listings, franchise
              concepts, funding routes, and research. It grows every quarter, and every
              entry carries the date it was last reviewed.
            </p>
          </Prose>

          <HorizonCard
            eyebrow="Our position"
            title="Fewer opinions. More arithmetic."
            body="One scale, published weights, and a date on every figure."
            ctaLabel="Read the methodology"
            ctaHref="/methodology"
            minHeight="20rem"
          />
        </div>
      </div>
    </>
  );
}
