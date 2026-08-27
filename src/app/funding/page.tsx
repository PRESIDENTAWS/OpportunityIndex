import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NewsletterCard } from "@/components/NewsletterCard";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { Card, PageHeader } from "@/components/PageShell";
import { listFundingPrograms } from "@/lib/repository";
import { moneyCompact } from "@/lib/format";

export const metadata: Metadata = {
  title: "Business Funding",
  description:
    "SBA loans, DSCR property loans, lines of credit, equipment finance, microloans, and revenue-based financing compared on rate, speed, and eligibility.",
};

export default async function FundingPage() {
  const programs = await listFundingPrograms();

  return (
    <>
      <PageHeader
        eyebrow="Capital"
        title="Business Funding"
        description="Six routes to capital, compared on the three things that actually decide which one you use: what it costs, how fast it lands, and whether you qualify."
      />

      <div className="container-oi grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          {/* Desktop comparison table */}
          <div
            className="hidden overflow-x-auto rounded-[var(--radius-brand)] border lg:block"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <thead>
                <tr
                  className="text-left text-xs"
                  style={{ backgroundColor: "var(--bg-subtle)", color: "var(--fg-muted)" }}
                >
                  <th scope="col" className="px-4 py-3 font-semibold">Funding Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Typical Rate</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Speed</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Min. Credit</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr
                    key={program.slug}
                    className="border-t transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/funding/${program.slug}`} className="font-semibold hover:text-[var(--accent)]">
                        {program.name}
                      </Link>
                      <span className="block text-xs" style={{ color: "var(--fg-faint)" }}>
                        {program.fundingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {moneyCompact(program.amount.min)} – {moneyCompact(program.amount.max)}
                    </td>
                    <td className="px-4 py-3">{program.typicalRate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{program.speed}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {program.minCreditScore ?? "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--fg-muted)" }}>
                      {program.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {programs.map((program) => (
              <Card as="li" key={program.slug} className="p-4">
                <Link href={`/funding/${program.slug}`} className="block">
                  <h2 className="font-semibold">{program.name}</h2>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                    {program.fundingType}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    {[
                      ["Amount", `${moneyCompact(program.amount.min)} – ${moneyCompact(program.amount.max)}`],
                      ["Rate", program.typicalRate],
                      ["Speed", program.speed],
                      ["Min. credit", String(program.minCreditScore ?? "—")],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt style={{ color: "var(--fg-faint)" }}>{label}</dt>
                        <dd className="mt-0.5 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </Card>
            ))}
          </ul>

          <AffiliateDisclosure variant="block" className="mt-6" />

        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Match the instrument to the need</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              Long-lived assets want long-term debt. Working capital wants a revolving
              line. Funding a truck with a credit line is how good businesses end up
              paying 20% on a five-year asset.
            </p>
          </Card>
          <NewsletterCard />
        </aside>
      </div>
    </>
  );
}
