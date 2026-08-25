import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Card, PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Placement formats, sponsorship options, and the editorial rules that govern advertising on Opportunity Index.",
};

const PLACEMENTS = [
  { format: "leaderboard" as const, name: "Header Leaderboard", note: "Above the primary navigation on every page." },
  { format: "in-content" as const, name: "In-Content Banner", note: "Between result rows and inside articles." },
  { format: "half-page" as const, name: "Sidebar Half Page", note: "In the sponsor rail beside index and detail pages." },
  { format: "in-feed" as const, name: "Mobile In-Feed", note: "Between cards in the mobile results list." },
];

export default function AdvertisePage() {
  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Advertise"
        description="Reach people at the moment they are choosing what to start, buy, or fund."
      />

      <div className="container-oi py-8">
        <ul className="grid gap-4 sm:grid-cols-2">
          {PLACEMENTS.map((placement) => (
            <Card as="li" key={placement.name} className="p-5">
              <h2 className="font-semibold">{placement.name}</h2>
              <p className="mt-1 mb-4 text-sm" style={{ color: "var(--fg-muted)" }}>
                {placement.note}
              </p>
              <AdSlot format={placement.format} />
            </Card>
          ))}
        </ul>

        <div className="mt-10">
          <Prose>
            <h2>What sponsorship does not buy</h2>
            <p>
              Scores, ranks, and inclusion in the index are not for sale. Sponsored
              placements are labelled as such wherever they appear, and no scoring
              factor accounts for advertising relationships. If a sponsor is also
              covered editorially, the coverage is written and scored exactly as it
              would be otherwise.
            </p>

            <h2>Get in touch</h2>
            <p>
              Send the formats you are interested in, your target categories, and your
              flight dates via the{" "}
              <Link href="/contact" className="underline underline-offset-4">
                contact page
              </Link>
              .
            </p>
          </Prose>
        </div>
      </div>
    </>
  );
}
