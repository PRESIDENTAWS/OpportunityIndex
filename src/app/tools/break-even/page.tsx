import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { BreakEvenCalculator } from "@/components/BreakEvenCalculator";
import { Breadcrumbs, PageHeader } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Break-Even Calculator",
  description:
    "Work out how many sales a month cover your fixed costs, and how long until the money you put in comes back.",
};

export default function BreakEvenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Break-Even Calculator"
        description="Two numbers decide whether a business works: what one sale contributes, and how many of them you need. This gives you both."
      >
        <div className="mt-4">
          <Breadcrumbs
            trail={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Break-Even" }]}
          />
        </div>
      </PageHeader>

      <div className="container-oi py-8">
        <BreakEvenCalculator />
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
