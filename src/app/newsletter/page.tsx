import type { Metadata } from "next";
import { HorizonCard } from "@/components/HorizonCard";
import { Icon } from "@/components/Icon";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Card, PageHeader } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "A weekly email: newly scored opportunities, fresh acquisition listings, and what changed in the index.",
};

const CONTENTS = [
  { icon: "bolt", title: "New and re-scored", body: "Every model added or revised that week, with what moved and why." },
  { icon: "tag", title: "Fresh listings", body: "Businesses for sale that cleared our checks, before they hit the big portals." },
  { icon: "chart", title: "One number", body: "A single figure from the index, explained in a couple of paragraphs." },
];

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Weekly"
        title="Get Weekly Opportunities"
        description="One email a week. High-potential ideas, new listings, and exclusive research — no course pitches."
      />

      <div className="container-oi grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <Card className="p-6">
            <h2 className="font-bold">Subscribe</h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
              Free, weekly, and one click to leave.
            </p>
            <NewsletterForm className="mt-4 max-w-md" />
          </Card>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {CONTENTS.map((item) => (
              <Card as="li" key={item.title} className="p-4">
                <Icon name={item.icon} size={22} style={{ color: "var(--accent)" }} />
                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                  {item.body}
                </p>
              </Card>
            ))}
          </ul>
        </div>

        <HorizonCard
          title="Fewer opinions. More arithmetic."
          body="Published weights, a date on every figure, and no score anyone can buy."
          ctaLabel="How we score"
          ctaHref="/methodology"
          minHeight="20rem"
        />
      </div>
    </>
  );
}
