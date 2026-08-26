import type { ScoringFactorKey } from "@/lib/contract";
import type { ScoringFactor } from "@/lib/types";

interface ScoreBreakdownProps {
  /** The published scoring model, read from the contract's reference data. */
  factors: ScoringFactor[];
  /** This opportunity's rating for each factor, 0-100. */
  values: Record<ScoringFactorKey, number>;
}

/** Horizontal bars for the six factors, with each factor's published weight. */
export function ScoreBreakdown({ factors, values }: ScoreBreakdownProps) {
  return (
    <dl className="space-y-3.5">
      {factors.map((factor) => {
        const value = values[factor.key];
        return (
          <div key={factor.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="font-medium">
                {factor.label}
                <span className="ml-2 text-xs" style={{ color: "var(--fg-faint)" }}>
                  {Math.round(factor.weight * 100)}% weight
                </span>
              </dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--bg-inset)" }}
              role="img"
              aria-label={`${factor.label}: ${value} out of 100`}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: "var(--accent)" }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>
              {factor.description}
            </p>
          </div>
        );
      })}
    </dl>
  );
}
