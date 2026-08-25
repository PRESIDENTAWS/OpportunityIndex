import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs, PageHeader } from "@/components/PageShell";
import { StartupCostCalculator } from "@/components/StartupCostCalculator";

export const metadata: Metadata = {
  title: "Startup Cost Calculator",
  description:
    "Add up what a launch really costs — equipment, licences, insurance, stock, contingency, and personal runway.",
};

export default function StartupCostPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Startup Cost Calculator"
        description="Most people budget the equipment and forget the contingency and the months before revenue. This adds all three."
      >
        <div className="mt-4">
          <Breadcrumbs
            trail={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Startup Cost" }]}
          />
        </div>
      </PageHeader>

      <div className="container-oi py-8">
        <StartupCostCalculator />
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
