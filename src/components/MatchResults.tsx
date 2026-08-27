import Link from "next/link";
import { Icon } from "./Icon";
import { ScoreBadge } from "./ScoreBadge";
import { hoursRange, moneyRange } from "@/lib/format";
import type { MatchResult } from "@/lib/matching";

/**
 * Ranked match results.
 *
 * Shows the Match Score and the Opportunity Score side by side and never
 * combines them: one says "this fits you", the other says "this is a good
 * opportunity", and a reader needs to see when those disagree.
 */
export function MatchResults({ results }: { results: MatchResult[] }) {
  if (results.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-brand)] border border-dashed px-6 py-12 text-center"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <Icon name="search" size={28} className="mx-auto" style={{ color: "var(--fg-faint)" }} />
        <p className="mt-3 font-medium">Nothing matches that location preference.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "var(--fg-muted)" }}>
          Try “Either” to see both online and local opportunities.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {results.map((result, index) => {
        const { opportunity: o } = result;
        return (
          <li key={o.slug}>
            <article
              className="rounded-[var(--radius-brand)] border p-4 sm:p-5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 w-5 shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color: "var(--fg-faint)" }}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        <Link href={`/hustles/${o.slug}`} className="hover:text-[var(--accent)]">
                          {o.name}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                        {o.categoryLabel} · {o.flexibilityLabel}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p
                          className="text-[0.55rem] font-semibold tracking-eyebrow uppercase"
                          style={{ color: "var(--fg-faint)" }}
                        >
                          Match
                        </p>
                        <p
                          className="text-lg font-bold tabular-nums"
                          style={{ color: "var(--accent)" }}
                        >
                          {result.matchScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-[0.55rem] font-semibold tracking-eyebrow uppercase"
                          style={{ color: "var(--fg-faint)" }}
                        >
                          Score
                        </p>
                        <ScoreBadge score={o.score} size="sm" className="mt-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                    {result.headline}
                  </p>

                  {/* Why this ranked where it did. */}
                  <dl className="mt-3 grid grid-cols-3 gap-2">
                    {result.components.map((component) => (
                      <div key={component.key}>
                        <dt
                          className="text-[0.6rem] font-semibold tracking-eyebrow uppercase"
                          style={{ color: "var(--fg-faint)" }}
                        >
                          {component.label}
                        </dt>
                        <dd className="mt-1 flex items-center gap-1.5">
                          <span
                            className="h-1 flex-1 overflow-hidden rounded-full"
                            style={{ backgroundColor: "var(--bg-inset)" }}
                          >
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${component.value}%`,
                                backgroundColor:
                                  component.value >= 67
                                    ? "var(--score-fg)"
                                    : component.value >= 34
                                      ? "var(--score-mid-fg)"
                                      : "var(--border-strong)",
                              }}
                            />
                          </span>
                          <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
                            {component.value}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p
                    className="mt-3 text-xs tabular-nums"
                    style={{ color: "var(--fg-faint)" }}
                  >
                    {moneyRange(o.startupCost)} to start · {hoursRange(o.hoursPerWeek)} ·{" "}
                    {moneyRange(o.monthlyProfit)}/mo
                  </p>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
