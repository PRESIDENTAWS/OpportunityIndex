import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { CompareTool } from "@/components/CompareTool";
import { Breadcrumbs, PageHeader } from "@/components/PageShell";
import { getScoringFactors, listOpportunities } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Compare Opportunities",
  description:
    "Put two business models side by side across all six scoring factors and see exactly where they differ.",
};

export default async function ComparePage() {
  const [opportunities, scoringFactors] = await Promise.all([
    listOpportunities({ sort: "name" }),
    getScoringFactors(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Compare Opportunities"
        description="Overall scores hide the shape of a business. Comparing factor by factor shows whether one option is genuinely better, or just better at things you do not care about."
      >
        <div className="mt-4">
          <Breadcrumbs
            trail={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Compare" }]}
          />
        </div>
      </PageHeader>

      <div className="container-oi py-8">
        <CompareTool opportunities={opportunities} scoringFactors={scoringFactors} />
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
