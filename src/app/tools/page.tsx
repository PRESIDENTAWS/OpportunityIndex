import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/Icon";
import { Card, PageHeader } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Tools & Calculators",
  description:
    "Work out what a launch costs, when it breaks even, and how two opportunities compare on the same six factors.",
};

const TOOLS = [
  {
    href: "/tools/startup-cost",
    icon: "calculator",
    title: "Startup Cost Calculator",
    body: "Add up equipment, licences, insurance, and stock — then see the contingency most people forget.",
  },
  {
    href: "/tools/break-even",
    icon: "chart",
    title: "Break-Even Calculator",
    body: "Find the number of customers, and the month, at which the business starts paying you.",
  },
  {
    href: "/tools/compare",
    icon: "scale",
    title: "Compare Opportunities",
    body: "Two models side by side across all six scoring factors, with the gaps called out.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Tools & Calculators"
        description="The arithmetic that decides whether an opportunity is right for you, rather than merely appealing."
      />

      <div className="container-oi py-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <Card as="li" key={tool.href} className="p-5">
              <Link href={tool.href} className="block">
                <Icon name={tool.icon} size={26} style={{ color: "var(--accent)" }} />
                <h2 className="mt-3 font-semibold">{tool.title}</h2>
                <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
                  {tool.body}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: "var(--accent)" }}>
                  Open
                  <Icon name="arrowRight" size={14} />
                </p>
              </Link>
            </Card>
          ))}
        </ul>

        <div className="mt-8">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
