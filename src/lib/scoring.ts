import { SCORE_FACTORS, type ScoreFactors } from "./types";

/**
 * The Overall Score: a weighted blend of the six factors, rounded to an
 * integer 0-100. Every score shown on the site comes through here, so the
 * number on a card and the number on a detail page can never drift apart.
 */
export function overallScore(factors: ScoreFactors): number {
  const total = SCORE_FACTORS.reduce(
    (sum, factor) => sum + factors[factor.key] * factor.weight,
    0,
  );
  return Math.round(total);
}

export type ScoreTier = "high" | "mid" | "low";

export function scoreTier(score: number): ScoreTier {
  if (score >= 80) return "high";
  if (score >= 65) return "mid";
  return "low";
}

/** Plain-language read on a score, used under the score badge on detail pages. */
export function scoreVerdict(score: number): string {
  if (score >= 88) return "Exceptional — top of the index this quarter.";
  if (score >= 80) return "Strong — favourable on most factors.";
  if (score >= 70) return "Solid — workable with the right advantages.";
  if (score >= 60) return "Mixed — one or two factors carry real drag.";
  return "Challenging — go in with clear eyes.";
}
