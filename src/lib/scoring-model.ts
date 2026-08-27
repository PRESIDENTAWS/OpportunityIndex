import type { Flexibility, OpportunityRow } from "./contract";

/**
 * What the scorer needs to read.
 *
 * Deliberately excludes `overall_score`: that is this module's output, and
 * requiring it as input would let a caller pass a score in and get it back.
 */
export type ScorableRow = Omit<OpportunityRow, "overall_score">;

/**
 * The published scoring model — one declarative definition.
 *
 * The scorer, the score breakdown, the matching engine, and /methodology all
 * read this array. Adding or reweighting a dimension is an entry here plus a
 * migration updating `opportunities.overall_score` and the `scoring_factors`
 * table; nothing else changes, and in particular the matching engine never
 * needs rewriting.
 *
 * Ratings are 0-100 and **higher is always better for the operator**, which
 * inverts the intuitive reading of affordability: a high "Startup
 * Affordability" means *cheap* to start.
 *
 * Weights must sum to exactly 1. `assertModelIsValid()` below enforces that at
 * module load, mirroring the deferred constraint trigger on `scoring_factors`.
 */

/** How location-independent the work is, derived from the flexibility enum. */
export const FLEXIBILITY_SCORES: Record<Flexibility, number> = {
  anywhere: 100,
  remote: 70,
  local: 30,
};

export type ScoringDimensionKey =
  | "profit_potential"
  | "startup_cost"
  | "time_to_revenue"
  | "demand"
  | "flexibility";

export interface ScoringDimension {
  key: ScoringDimensionKey;
  label: string;
  description: string;
  weight: number;
  /** Reads this dimension's 0-100 rating off an opportunity row. */
  rate: (row: ScorableRow) => number;
}

/**
 * Weights match supabase/migrations/0002_scoring_model.sql exactly. Changing
 * one here without changing the migration would make the displayed model
 * disagree with the stored score.
 */
export const SCORING_MODEL: ScoringDimension[] = [
  {
    key: "profit_potential",
    label: "Income Potential",
    description: "Realistic monthly take-home once the operation is established.",
    weight: 0.278,
    rate: (row) => row.factor_profit_potential,
  },
  {
    key: "startup_cost",
    label: "Startup Affordability",
    description: "Little capital is needed to reach a first paying customer.",
    weight: 0.222,
    rate: (row) => row.factor_startup_cost,
  },
  {
    key: "time_to_revenue",
    label: "Speed to First Revenue",
    description: "The gap between starting and being paid is short.",
    weight: 0.222,
    rate: (row) => row.factor_time_to_revenue,
  },
  {
    key: "demand",
    label: "Demand Durability",
    description:
      "Buyers are actively searching and spending, and are likely to keep doing so.",
    weight: 0.167,
    rate: (row) => row.factor_demand,
  },
  {
    key: "flexibility",
    label: "Flexibility",
    description:
      "The work can be done without being tied to one location. Derived from each opportunity's flexibility: anywhere 100, remote 70, local 30.",
    weight: 0.111,
    rate: (row) => FLEXIBILITY_SCORES[row.flexibility],
  },
];

/**
 * Dimensions that are part of the intended model but are **not scored**,
 * because no data supports them.
 *
 * Published on /methodology rather than quietly omitted: a reader comparing our
 * stated model to our arithmetic should find the difference explained. Each
 * becomes a real dimension above once every opportunity carries a consistent
 * editorial rating — not before.
 */
export const PLANNED_DIMENSIONS: { label: string; reason: string }[] = [
  {
    label: "Operational Simplicity",
    reason:
      "How little day-to-day complexity the business carries — staffing, premises, compliance, and moving parts. No opportunity record holds a rating for this yet, and no existing field is an honest proxy for it.",
  },
  {
    label: "Experience Fit",
    reason:
      "How much prior expertise an opportunity assumes. Every record currently lists exactly three skills, so skill count carries no signal, and inferring difficulty from cost or hours would be a guess presented as a measurement.",
  },
];

/** Total of all scored weights. Exactly 1 when the model is coherent. */
export function totalWeight(): number {
  return SCORING_MODEL.reduce((sum, d) => sum + d.weight, 0);
}

/**
 * Fails loudly at module load if the weights drift.
 *
 * A silently-not-1 model produces scores that are wrong but plausible, which is
 * the worst kind of wrong for a product whose claim is that its numbers are
 * honest.
 */
function assertModelIsValid(): void {
  // Compare in thousandths to avoid floating-point noise.
  const total = Math.round(totalWeight() * 1000);
  if (total !== 1000) {
    throw new Error(
      `Scoring model weights must sum to 1.000, got ${(total / 1000).toFixed(3)}`,
    );
  }
}

assertModelIsValid();

/**
 * Computes the overall score for a row.
 *
 * In production this mirrors the database's generated `overall_score` column;
 * until Supabase is connected it stands in for it. Either way the arithmetic
 * lives in exactly one place.
 */
export function computeOverallScore(row: ScorableRow): number {
  return Math.round(
    SCORING_MODEL.reduce((sum, d) => sum + d.rate(row) * d.weight, 0),
  );
}

/** Every dimension's rating for one row, keyed for display. */
export function rateAll(row: ScorableRow): Record<ScoringDimensionKey, number> {
  const ratings = {} as Record<ScoringDimensionKey, number>;
  for (const dimension of SCORING_MODEL) {
    ratings[dimension.key] = dimension.rate(row);
  }
  return ratings;
}
