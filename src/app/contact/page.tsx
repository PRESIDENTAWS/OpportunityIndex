import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Opportunity Index team about listings, corrections, advertising, or research.",
};

const ROUTES = [
  { subject: "Corrections", body: "A figure looks wrong, or an entry is out of date.", email: "corrections@opportunityindex.com" },
  { subject: "Listings", body: "Submit a business for sale or a franchise concept.", email: "listings@opportunityindex.com" },
  { subject: "Advertising", body: "Placements, sponsorships, and flight dates.", email: "advertise@opportunityindex.com" },
  { subject: "Press & research", body: "Citing the index or requesting underlying data.", email: "research@opportunityindex.com" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in Touch"
        description="Corrections get priority. If a number on this site is wrong, we want to know before your readers do."
      />

      <div className="container-oi py-8">
        <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
          {ROUTES.map((route) => (
            <Card as="li" key={route.subject} className="p-5">
              <h2 className="font-semibold">{route.subject}</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
                {route.body}
              </p>
              <a
                href={`mailto:${route.email}`}
                className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
                {route.email}
              </a>
            </Card>
          ))}
        </ul>
      </div>
    </>
  );
}
