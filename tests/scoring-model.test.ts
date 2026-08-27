import { describe, expect, it } from "vitest";
import seed from "@contract/opportunities.seed.json";
import {
  computeOverallScore,
  FLEXIBILITY_SCORES,
  PLANNED_DIMENSIONS,
  rateAll,
  SCORING_MODEL,
  totalWeight,
  type ScorableRow,
} from "@/lib/scoring-model";

/**
 * The scoring model.
 *
 * The property under test: the published model, the arithmetic, and the
 * database's generated column can never disagree.
 */

const OPPORTUNITIES = (seed as { opportunities: ScorableRow[] }).opportunities;

describe("model coherence", () => {
  it("weights sum to exactly 1", () => {
    // Compared in thousandths, matching the database's numeric(4,3) column.
    expect(Math.round(totalWeight() * 1000)).toBe(1000);
  });

  it("publishes exactly the five factors the MVP can support", () => {
    expect(SCORING_MODEL.map((d) => d.key)).toEqual([
      "profit_potential",
      "startup_cost",
      "time_to_revenue",
      "demand",
      "flexibility",
    ]);
  });

  it("matches the weights in migration 0002", () => {
    const weights = Object.fromEntries(SCORING_MODEL.map((d) => [d.key, d.weight]));
    expect(weights).toEqual({
      profit_potential: 0.278,
      startup_cost: 0.222,
      time_to_revenue: 0.222,
      demand: 0.167,
      flexibility: 0.111,
    });
  });

  it("declares the unscored dimensions rather than omitting them silently", () => {
    // These are published on /methodology; dropping them from here would make
    // the site quietly claim a complete model.
    expect(PLANNED_DIMENSIONS.map((d) => d.label)).toEqual([
      "Operational Simplicity",
      "Experience Fit",
    ]);
    for (const dimension of PLANNED_DIMENSIONS) {
      expect(dimension.reason.length).toBeGreaterThan(40);
    }
  });

  it("keeps planned dimensions out of the scored model", () => {
    const scored = SCORING_MODEL.map((d) => d.label.toLowerCase());
    expect(scored).not.toContain("operational simplicity");
    expect(scored).not.toContain("experience fit");
  });
});

describe("flexibility derivation", () => {
  it("maps the contract enum to the published values", () => {
    expect(FLEXIBILITY_SCORES).toEqual({ anywhere: 100, remote: 70, local: 30 });
  });

  it("rates every opportunity's flexibility from its enum", () => {
    for (const row of OPPORTUNITIES) {
      expect(rateAll(row).flexibility).toBe(FLEXIBILITY_SCORES[row.flexibility]);
    }
  });
});

describe("computeOverallScore", () => {
  /** Independent restatement of migration 0002's generated expression. */
  function expectedScore(row: ScorableRow): number {
    return Math.round(
      row.factor_profit_potential * 0.278 +
        row.factor_startup_cost * 0.222 +
        row.factor_time_to_revenue * 0.222 +
        row.factor_demand * 0.167 +
        FLEXIBILITY_SCORES[row.flexibility] * 0.111,
    );
  }

  it("matches the database's generated column for every seeded opportunity", () => {
    for (const row of OPPORTUNITIES) {
      expect(computeOverallScore(row)).toBe(expectedScore(row));
    }
  });

  it("produces a whole number in 0..100 for every opportunity", () => {
    for (const row of OPPORTUNITIES) {
      const score = computeOverallScore(row);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("scores a perfect row 100 and an empty row at the flexibility floor", () => {
    const base = OPPORTUNITIES[0]!;
    const perfect: ScorableRow = {
      ...base,
      flexibility: "anywhere",
      factor_profit_potential: 100,
      factor_startup_cost: 100,
      factor_time_to_revenue: 100,
      factor_demand: 100,
    };
    expect(computeOverallScore(perfect)).toBe(100);

    const zeroed: ScorableRow = {
      ...base,
      flexibility: "local",
      factor_profit_potential: 0,
      factor_startup_cost: 0,
      factor_time_to_revenue: 0,
      factor_demand: 0,
    };
    // Only the derived flexibility contributes: 30 * 0.111 = 3.33 -> 3.
    expect(computeOverallScore(zeroed)).toBe(3);
  });

  it("ignores factors the model no longer scores", () => {
    const base = OPPORTUNITIES[0]!;
    const withDifferentUnscored: ScorableRow = {
      ...base,
      factor_scalability: base.factor_scalability === 0 ? 100 : 0,
      factor_competition: base.factor_competition === 0 ? 100 : 0,
    };
    // Their data is preserved in the row but must not move the score.
    expect(computeOverallScore(withDifferentUnscored)).toBe(computeOverallScore(base));
  });
});
