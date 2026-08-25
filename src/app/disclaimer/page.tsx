import type { Metadata } from "next";
import { PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "What this site is, and what it is not.",
};

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Disclaimer" description="What this site is, and what it is not." />
      <div className="container-oi py-8">
        <Prose>
          <h2>Not professional advice</h2>
          <p>
            Nothing on this site is financial, investment, legal, tax, or accounting
            advice. It is research and general information. Before committing capital or
            signing an agreement, consult professionals licensed in your jurisdiction.
          </p>

          <h2>No guarantee of results</h2>
          <p>
            Profit figures describe what a typical operator may realistically achieve —
            not what you will achieve. Most new businesses earn less than these ranges
            in their first year, and some earn nothing. Scores measure the shape of an
            opportunity, not your probability of success in it.
          </p>

          <h2>Affiliate and sponsored content</h2>
          <p>
            Some outbound links may earn us a commission, and some placements are paid.
            Both are labelled. Neither affects scores, ranks, or inclusion in the index.
          </p>

          <h2>Third-party figures</h2>
          <p>
            Acquisition listings, franchise terms, and lending rates come from third
            parties and change without notice. Verify every figure directly with the
            source before relying on it.
          </p>
        </Prose>
      </div>
    </>
  );
}
