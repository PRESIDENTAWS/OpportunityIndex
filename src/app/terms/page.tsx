import type { Metadata } from "next";
import { PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using Opportunity Index.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" description="The rules for using Opportunity Index." />
      <div className="container-oi py-8">
        <Prose>
          <p>Last updated August 2026. By using this site you agree to these terms.</p>

          <h2>Use of the site</h2>
          <p>
            You may read, share, and cite content here with attribution. You may not
            scrape the index at scale, republish it wholesale, or present our scores as
            your own analysis.
          </p>

          <h2>Accuracy</h2>
          <p>
            We work to keep figures current and correct them promptly when they are
            wrong, but the site is provided as-is. Cost, profit, and time figures are
            researched estimates and may not reflect your market or your circumstances.
          </p>

          <h2>Third-party listings</h2>
          <p>
            Businesses for sale, franchise concepts, and funding terms are supplied by
            third parties. Their inclusion is not an endorsement and not a verification
            of the figures they provide. Conduct your own due diligence.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the extent permitted by law, Opportunity Index is not liable for losses
            arising from decisions made on the basis of content published here.
          </p>
        </Prose>
      </div>
    </>
  );
}
