import Link from "next/link";
import { AdSlot } from "./AdSlot";
import { Icon } from "./Icon";
import { ScoreBadge } from "./ScoreBadge";
import { hoursRange, moneyRange } from "@/lib/format";
import { categoryLabel, type ScoredOpportunity } from "@/lib/queries";

interface OpportunityTableProps {
  opportunities: ScoredOpportunity[];
  /** Insert an in-content ad after every N rows. 0 disables it. */
  adEvery?: number;
  /** Ranks are drawn from position in this list unless `startRank` shifts them. */
  startRank?: number;
  /** Drops the redundant Category column for narrower layouts. */
  compact?: boolean;
}

export function OpportunityTable({
  opportunities,
  adEvery = 15,
  startRank = 1,
  compact = false,
}: OpportunityTableProps) {
  const columnCount = compact ? 6 : 8;
  if (opportunities.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-brand)] border border-dashed px-6 py-16 text-center"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <Icon name="search" size={30} className="mx-auto" style={{ color: "var(--fg-faint)" }} />
        <p className="mt-4 font-medium">No opportunities match those filters.</p>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
          Try widening the startup cost range or clearing a category.
        </p>
      </div>
    );
  }

  const shouldBreak = (index: number) =>
    adEvery > 0 && (index + 1) % adEvery === 0 && index + 1 < opportunities.length;

  return (
    <>
      {/* Desktop: dense ranked table */}
      <div
        className="hidden overflow-x-auto rounded-[var(--radius-brand)] border lg:block"
        style={{ borderColor: "var(--border)" }}
      >
        <table className={`w-full border-collapse text-sm ${compact ? "min-w-[38rem]" : "min-w-[52rem]"}`}>
          <thead>
            <tr
              className="text-left text-xs font-semibold"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--fg-muted)" }}
            >
              <th scope="col" className="w-12 px-4 py-3 font-semibold">#</th>
              <th scope="col" className="px-4 py-3 font-semibold">Opportunity</th>
              {!compact && <th scope="col" className="px-4 py-3 font-semibold">Category</th>}
              <th scope="col" className="px-4 py-3 font-semibold">Startup Cost</th>
              <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                {compact ? "Profit / Month" : "Profit Potential / Month"}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">Time / Week</th>
              {!compact && <th scope="col" className="px-4 py-3 font-semibold">Flexibility</th>}
              <th scope="col" className="px-4 py-3 text-right font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o, index) => (
              <RowGroup key={o.slug} showAd={shouldBreak(index)} adEvery={adEvery} columnCount={columnCount}>
                <tr
                  className="border-t transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-4 py-3 tabular-nums" style={{ color: "var(--fg-faint)" }}>
                    {startRank + index}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/hustles/${o.slug}`} className="flex items-center gap-3 group">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border"
                        style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                      >
                        <Icon name={o.icon} size={18} />
                      </span>
                      <span>
                        <span className="block font-semibold whitespace-nowrap group-hover:text-[var(--accent)]">
                          {o.name}
                        </span>
                        <span className="block text-xs" style={{ color: "var(--fg-faint)" }}>
                          {categoryLabel(o.category)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  {!compact && (
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                      {categoryLabel(o.category)}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {moneyRange(o.startupCost)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {moneyRange(o.monthlyProfit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {hoursRange(o.hoursPerWeek)}
                  </td>
                  {!compact && (
                    <td className="px-4 py-3" style={{ color: "var(--fg-muted)" }}>
                      {o.flexibility}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <ScoreBadge score={o.score} />
                  </td>
                </tr>
              </RowGroup>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 lg:hidden">
        {opportunities.map((o, index) => (
          <li key={o.slug}>
            <Link
              href={`/hustles/${o.slug}`}
              className="flex items-start gap-3 rounded-[var(--radius-brand)] border p-3.5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <Icon name={o.icon} size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {startRank + index}. {o.name}
                </span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--fg-muted)" }}>
                  {o.tagline}
                </span>
                <span className="mt-1.5 block text-xs tabular-nums" style={{ color: "var(--fg-faint)" }}>
                  {moneyRange(o.startupCost)} · {hoursRange(o.hoursPerWeek)} · {o.flexibility}
                </span>
              </span>
              <ScoreBadge score={o.score} size="sm" />
            </Link>
            {shouldBreak(index) && (
              <div className="pt-2">
                <AdSlot format="in-feed" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * A table row plus the optional ad row that follows it. Ads live in the table
 * as a full-width cell so column alignment is never disturbed.
 */
function RowGroup({
  children,
  showAd,
  adEvery,
  columnCount,
}: {
  children: React.ReactNode;
  showAd: boolean;
  adEvery: number;
  columnCount: number;
}) {
  return (
    <>
      {children}
      {showAd && (
        <tr className="border-t" style={{ borderColor: "var(--border)" }}>
          <td colSpan={columnCount} className="p-3">
            <AdSlot format="in-content" note={`Every ${adEvery} Rows`} />
          </td>
        </tr>
      )}
    </>
  );
}
