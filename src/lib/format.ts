import type { Range } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** $1,250 — whole dollars, for prices and asking figures. */
export function money(value: number): string {
  return usd.format(value);
}

/** $1.2M / $485K / $940 — for dense table cells. */
export function moneyCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `$${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }
  return `$${value}`;
}

/** "$100 – $500" or "$1,000 – $5,000+" when the range is open-ended. */
export function moneyRange(range: Range): string {
  const high = money(range.max) + (range.openEnded ? "+" : "");
  return `${money(range.min)} – ${high}`;
}

/** "5 – 15 hrs" */
export function hoursRange(range: Range): string {
  return `${range.min} – ${range.max} hrs`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}
