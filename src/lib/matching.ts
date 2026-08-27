import type { Opportunity } from "./types";

/**
 * The matching engine.
 *
 * Answers the product's one question: given what someone has to work with,
 * which opportunities actually fit?
 *
 * Two numbers are reported separately and never conflated:
 *
 *   Match Score        how well this fits YOUR capital, time, and income goal
 *   Opportunity Score  how good the opportunity is in general, unchanged
 *
 * Blending them would hide a poor fit behind a strong opportunity. Ranking is
 * by match, then by opportunity score, then by name — fully deterministic, so
 * the same inputs always produce the same order.
 *
 * Pure and dependency-free: no Supabase, no `server-only`, no React.
 */

export type LocationPreference = "online" | "local" | "either";

export interface MatchInput {
  /** Capital available to start, in whole US dollars. */
  capital: number;
  /** Hours per week available. */
  hoursPerWeek: number;
  locationPreference: LocationPreference;
  /** Target monthly income, in whole US dollars. */
  monthlyIncomeGoal: number;
}

export interface MatchComponent {
  key: "capital" | "time" | "income";
  label: string;
  /** 0-100. */
  value: number;
  weight: number;
  /** Plain-language explanation of this component's value. */
  note: string;
}

export interface MatchResult {
  opportunity: Opportunity;
  /** 0-100 fit against the reader's inputs. */
  matchScore: number;
  components: MatchComponent[];
  /** One-line summary of the strongest constraint. */
  headline: string;
}

/** How the three fit components are weighted. Sums to 1. */
export const MATCH_WEIGHTS = {
  capital: 0.4,
  time: 0.25,
  income: 0.35,
} as const;

/**
 * Location is a hard filter, not a weighted component.
 *
 * Someone who says "online only" means it. Scoring the other kind slightly
 * lower would still surface it, which is not what they asked for.
 *
 *   online  -> anywhere + remote, both doable without being somewhere specific
 *   local   -> location-bound work only
 *   either  -> everything
 *
 * `anywhere` work can technically be done locally, but treating it as a "local"
 * answer means someone asking for local businesses gets digital products —
 * those opportunities score higher and take every top slot. "Either" is there
 * for readers who genuinely do not mind.
 */
export function matchesLocation(
  opportunity: Opportunity,
  preference: LocationPreference,
): boolean {
  if (preference === "either") return true;
  if (preference === "online") {
    return opportunity.flexibility === "anywhere" || opportunity.flexibility === "remote";
  }
  return opportunity.flexibility === "local";
}

/** Linear 0-100 ramp: 0 at or below `min`, 100 at or above `max`. */
function ramp(value: number, min: number, max: number): number {
  if (max <= min) return value >= max ? 100 : 0;
  if (value <= min) return 0;
  if (value >= max) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Capital fit.
 *
 * 100 when the reader can fund the whole realistic range, 0 when they cannot
 * cover even the floor. Between the two it ramps, because a business you can
 * *just* start is a worse fit than one you can start comfortably.
 */
export function capitalFit(opportunity: Opportunity, capital: number): number {
  const { min, max } = opportunity.startupCost;
  if (capital >= max) return 100;
  if (capital < min) return 0;
  // Comfortably above the floor already counts for most of the score.
  return Math.max(50, ramp(capital, min, max));
}

/**
 * Time fit.
 *
 * 100 when the reader has the hours the work actually takes at its upper end,
 * 0 when they cannot meet the minimum.
 */
export function timeFit(opportunity: Opportunity, hoursPerWeek: number): number {
  const { min, max } = opportunity.hoursPerWeek;
  if (hoursPerWeek >= max) return 100;
  if (hoursPerWeek < min) return 0;
  return Math.max(50, ramp(hoursPerWeek, min, max));
}

/**
 * Income fit.
 *
 * 100 when the opportunity's realistic ceiling reaches the goal. Below that it
 * is the honest ratio: an opportunity topping out at $2,000 against a $10,000
 * goal scores 20, not "close enough".
 */
export function incomeFit(opportunity: Opportunity, monthlyIncomeGoal: number): number {
  if (monthlyIncomeGoal <= 0) return 100;
  const ceiling = opportunity.monthlyProfit.max;
  if (ceiling >= monthlyIncomeGoal) return 100;
  return Math.round((ceiling / monthlyIncomeGoal) * 100);
}

function money(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

function describe(
  opportunity: Opportunity,
  input: MatchInput,
): { components: MatchComponent[]; headline: string } {
  const capital = capitalFit(opportunity, input.capital);
  const time = timeFit(opportunity, input.hoursPerWeek);
  const income = incomeFit(opportunity, input.monthlyIncomeGoal);

  const components: MatchComponent[] = [
    {
      key: "capital",
      label: "Capital",
      value: capital,
      weight: MATCH_WEIGHTS.capital,
      note:
        capital === 100
          ? `Your ${money(input.capital)} covers the full ${money(opportunity.startupCost.min)}–${money(opportunity.startupCost.max)} range.`
          : capital === 0
            ? `Needs at least ${money(opportunity.startupCost.min)} to start.`
            : `Your ${money(input.capital)} covers the lower end of ${money(opportunity.startupCost.min)}–${money(opportunity.startupCost.max)}.`,
    },
    {
      key: "time",
      label: "Time",
      value: time,
      weight: MATCH_WEIGHTS.time,
      note:
        time === 100
          ? `${input.hoursPerWeek} hrs/week covers the ${opportunity.hoursPerWeek.min}–${opportunity.hoursPerWeek.max} hrs this typically takes.`
          : time === 0
            ? `Typically needs at least ${opportunity.hoursPerWeek.min} hrs/week.`
            : `${input.hoursPerWeek} hrs/week is within the ${opportunity.hoursPerWeek.min}–${opportunity.hoursPerWeek.max} hr range, at the lower end.`,
    },
    {
      key: "income",
      label: "Income",
      value: income,
      weight: MATCH_WEIGHTS.income,
      note:
        income === 100
          ? `Can realistically reach your ${money(input.monthlyIncomeGoal)}/month goal.`
          : `Realistically tops out near ${money(opportunity.monthlyProfit.max)}/month, short of your ${money(input.monthlyIncomeGoal)} goal.`,
    },
  ];

  // The headline names the binding constraint — the weakest component — because
  // that is what the reader needs to know first.
  const weakest = components.reduce((a, b) => (b.value < a.value ? b : a));
  const headline =
    weakest.value === 100
      ? "Fits your capital, time, and income goal."
      : weakest.note;

  return { components, headline };
}

/**
 * Ranks opportunities against the reader's inputs.
 *
 * Location is filtered first, then everything remaining is scored and sorted.
 * Nothing is dropped for a low match score: a poor fit shown honestly is more
 * useful than an empty page, and the caller decides how many to display.
 */
export function matchOpportunities(
  opportunities: Opportunity[],
  input: MatchInput,
): MatchResult[] {
  return opportunities
    .filter((o) => matchesLocation(o, input.locationPreference))
    .map((opportunity) => {
      const { components, headline } = describe(opportunity, input);
      const matchScore = Math.round(
        components.reduce((sum, c) => sum + c.value * c.weight, 0),
      );
      return { opportunity, matchScore, components, headline };
    })
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.opportunity.score - a.opportunity.score ||
        a.opportunity.name.localeCompare(b.opportunity.name),
    );
}

/** Sensible starting point for the form, in the middle of the seeded ranges. */
export const DEFAULT_MATCH_INPUT: MatchInput = {
  capital: 1000,
  hoursPerWeek: 15,
  locationPreference: "either",
  monthlyIncomeGoal: 3000,
};

const LOCATION_VALUES: LocationPreference[] = ["online", "local", "either"];

/**
 * Clamps an untrusted number into a sane range, falling back to a default.
 *
 * Currency formatting is stripped so "$1,500" parses, but the sign is read
 * BEFORE stripping: removing a leading minus along with the other punctuation
 * would silently turn "-500" into 500.
 */
function clampNumber(raw: unknown, fallback: number, min: number, max: number): number {
  let value: number;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const negative = trimmed.startsWith("-");
    const digits = trimmed.replace(/[^0-9.]/g, "");
    if (digits === "" || digits === ".") return fallback;
    value = Number(digits) * (negative ? -1 : 1);
  } else {
    value = Number(raw);
  }

  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Reads match inputs from URL search params.
 *
 * Holding them in the URL makes a matched result set shareable, refreshable,
 * and renderable on the server — the same property the filters already have.
 */
export function parseMatchInput(
  params: Record<string, string | string[] | undefined>,
): MatchInput {
  const location = typeof params.loc === "string" ? params.loc : undefined;
  return {
    capital: clampNumber(params.capital, DEFAULT_MATCH_INPUT.capital, 0, 1_000_000),
    hoursPerWeek: clampNumber(params.hours, DEFAULT_MATCH_INPUT.hoursPerWeek, 1, 80),
    locationPreference: LOCATION_VALUES.find((v) => v === location) ?? "either",
    monthlyIncomeGoal: clampNumber(params.goal, DEFAULT_MATCH_INPUT.monthlyIncomeGoal, 0, 1_000_000),
  };
}

/** True when the reader actually submitted the form. */
export function hasMatchInput(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return ["capital", "hours", "loc", "goal"].some((key) => typeof params[key] === "string");
}
