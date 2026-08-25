import { SCORE_FACTORS, type ScoreFactors } from "@/lib/types";

/** Horizontal bars for the six factors, with each factor's weight shown. */
export function ScoreBreakdown({ factors }: { factors: ScoreFactors }) {
  return (
    <dl className="space-y-3.5">
      {SCORE_FACTORS.map((factor) => {
        const value = factors[factor.key];
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
              {factor.meaning}
            </p>
          </div>
        );
      })}
    </dl>
  );
}
