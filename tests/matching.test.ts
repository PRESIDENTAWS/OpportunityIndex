import { describe, expect, it } from "vitest";
import {
  capitalFit,
  DEFAULT_MATCH_INPUT,
  hasMatchInput,
  incomeFit,
  matchesLocation,
  matchOpportunities,
  MATCH_WEIGHTS,
  parseMatchInput,
  timeFit,
  type MatchInput,
} from "@/lib/matching";
import type { Opportunity } from "@/lib/types";

/**
 * The matching engine.
 *
 * The property under test: the same inputs always produce the same ranking, and
 * a poor fit is reported as a poor fit rather than being flattered.
 */

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    slug: "test",
    name: "Test",
    tagline: "t",
    icon: "grid",
    categorySlug: "online",
    categoryLabel: "Online",
    startupCost: { min: 100, max: 500, openEnded: false },
    monthlyProfit: { min: 1000, max: 5000, openEnded: false },
    hoursPerWeek: { min: 5, max: 15 },
    flexibility: "anywhere",
    flexibilityLabel: "Anywhere",
    summary: "s",
    skills: [],
    pros: [],
    cons: [],
    tools: [],
    steps: [],
    factors: {
      profit_potential: 80,
      startup_cost: 80,
      time_to_revenue: 80,
      demand: 80,
      flexibility: 100,
    },
    score: 80,
    reviewedAt: "2026-01-01",
    ...overrides,
  };
}

const input: MatchInput = {
  capital: 1000,
  hoursPerWeek: 20,
  locationPreference: "either",
  monthlyIncomeGoal: 3000,
};

describe("weights", () => {
  it("sum to 1", () => {
    const total = MATCH_WEIGHTS.capital + MATCH_WEIGHTS.time + MATCH_WEIGHTS.income;
    expect(Math.round(total * 1000)).toBe(1000);
  });
});

describe("capitalFit", () => {
  it("is 100 when capital covers the whole range", () => {
    expect(capitalFit(makeOpportunity(), 500)).toBe(100);
    expect(capitalFit(makeOpportunity(), 10_000)).toBe(100);
  });

  it("is 0 when capital cannot cover the floor", () => {
    expect(capitalFit(makeOpportunity(), 99)).toBe(0);
    expect(capitalFit(makeOpportunity(), 0)).toBe(0);
  });

  it("sits between when capital covers only part of the range", () => {
    const value = capitalFit(makeOpportunity(), 300);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(100);
  });
});

describe("timeFit", () => {
  it("is 100 when the hours cover the upper end", () => {
    expect(timeFit(makeOpportunity(), 15)).toBe(100);
    expect(timeFit(makeOpportunity(), 40)).toBe(100);
  });

  it("is 0 below the minimum", () => {
    expect(timeFit(makeOpportunity(), 4)).toBe(0);
  });
});

describe("incomeFit", () => {
  it("is 100 when the ceiling reaches the goal", () => {
    expect(incomeFit(makeOpportunity(), 5000)).toBe(100);
    expect(incomeFit(makeOpportunity(), 1000)).toBe(100);
  });

  it("is the honest ratio when the ceiling falls short", () => {
    // $5,000 ceiling against a $10,000 goal is 50, not "close enough".
    expect(incomeFit(makeOpportunity(), 10_000)).toBe(50);
    expect(incomeFit(makeOpportunity(), 25_000)).toBe(20);
  });

  it("treats a zero goal as satisfied", () => {
    expect(incomeFit(makeOpportunity(), 0)).toBe(100);
  });
});

describe("location filtering", () => {
  const anywhere = makeOpportunity({ flexibility: "anywhere" });
  const remote = makeOpportunity({ flexibility: "remote" });
  const local = makeOpportunity({ flexibility: "local" });

  it("excludes location-bound work when online is chosen", () => {
    expect(matchesLocation(anywhere, "online")).toBe(true);
    expect(matchesLocation(remote, "online")).toBe(true);
    expect(matchesLocation(local, "online")).toBe(false);
  });

  it("returns only location-bound work when local is chosen", () => {
    // "anywhere" work could technically be done locally, but including it means
    // higher-scoring digital opportunities take every slot and someone asking
    // for local businesses never sees one.
    expect(matchesLocation(local, "local")).toBe(true);
    expect(matchesLocation(anywhere, "local")).toBe(false);
    expect(matchesLocation(remote, "local")).toBe(false);
  });

  it("includes everything when either is chosen", () => {
    for (const o of [anywhere, remote, local]) {
      expect(matchesLocation(o, "either")).toBe(true);
    }
  });
});

describe("matchOpportunities", () => {
  const affordable = makeOpportunity({ slug: "a", name: "Affordable", score: 70 });
  const expensive = makeOpportunity({
    slug: "b",
    name: "Expensive",
    startupCost: { min: 20_000, max: 50_000, openEnded: false },
    score: 95,
  });
  const localOnly = makeOpportunity({ slug: "c", name: "Local", flexibility: "local" });

  it("is deterministic: the same inputs give the same order", () => {
    const first = matchOpportunities([affordable, expensive, localOnly], input);
    const second = matchOpportunities([localOnly, expensive, affordable], input);
    expect(first.map((r) => r.opportunity.slug)).toEqual(
      second.map((r) => r.opportunity.slug),
    );
  });

  it("ranks an affordable fit above an unaffordable higher-scoring one", () => {
    const results = matchOpportunities([expensive, affordable], input);
    expect(results[0]!.opportunity.slug).toBe("a");
    // The stronger opportunity is still shown, just ranked by fit.
    expect(results[1]!.opportunity.slug).toBe("b");
  });

  it("never blends the match score into the opportunity score", () => {
    const [result] = matchOpportunities([expensive], input);
    expect(result!.opportunity.score).toBe(95);
    expect(result!.matchScore).toBeLessThan(95);
  });

  it("filters out location mismatches entirely", () => {
    const results = matchOpportunities([affordable, localOnly], {
      ...input,
      locationPreference: "online",
    });
    expect(results.map((r) => r.opportunity.slug)).toEqual(["a"]);
  });

  it("returns an empty list rather than throwing when nothing matches", () => {
    const results = matchOpportunities([localOnly], {
      ...input,
      locationPreference: "online",
    });
    expect(results).toEqual([]);
  });

  it("explains the binding constraint in the headline", () => {
    const [result] = matchOpportunities([expensive], input);
    expect(result!.headline).toContain("at least");
  });

  it("reports a clean fit when every component is satisfied", () => {
    const [result] = matchOpportunities([affordable], input);
    expect(result!.matchScore).toBe(100);
    expect(result!.headline).toBe("Fits your capital, time, and income goal.");
  });

  it("breaks ties by opportunity score, then name", () => {
    const low = makeOpportunity({ slug: "x", name: "Xeno", score: 60 });
    const high = makeOpportunity({ slug: "y", name: "Yak", score: 90 });
    const results = matchOpportunities([low, high], input);
    expect(results.map((r) => r.opportunity.slug)).toEqual(["y", "x"]);
  });
});

describe("parseMatchInput", () => {
  it("falls back to defaults when nothing is supplied", () => {
    expect(parseMatchInput({})).toEqual(DEFAULT_MATCH_INPUT);
  });

  it("reads valid values", () => {
    expect(
      parseMatchInput({ capital: "5000", hours: "25", goal: "8000", loc: "online" }),
    ).toEqual({
      capital: 5000,
      hoursPerWeek: 25,
      locationPreference: "online",
      monthlyIncomeGoal: 8000,
    });
  });

  it("clamps hostile or absurd values instead of trusting them", () => {
    const parsed = parseMatchInput({
      capital: "-999999",
      hours: "10000",
      goal: "abc",
      loc: "<script>",
    });
    expect(parsed.capital).toBe(0);
    expect(parsed.hoursPerWeek).toBe(80);
    expect(parsed.monthlyIncomeGoal).toBe(DEFAULT_MATCH_INPUT.monthlyIncomeGoal);
    expect(parsed.locationPreference).toBe("either");
  });

  it("strips currency formatting", () => {
    expect(parseMatchInput({ capital: "$1,500" }).capital).toBe(1500);
  });
});

describe("hasMatchInput", () => {
  it("is false before the form is submitted", () => {
    expect(hasMatchInput({})).toBe(false);
    expect(hasMatchInput({ q: "search" })).toBe(false);
  });

  it("is true once any match parameter is present", () => {
    expect(hasMatchInput({ capital: "1000" })).toBe(true);
    expect(hasMatchInput({ loc: "online" })).toBe(true);
  });
});
