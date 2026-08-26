"use client";

import { useState } from "react";
import { ScoreBadge } from "./ScoreBadge";
import { hoursRange, moneyRange } from "@/lib/format";
import type { Opportunity, ScoringFactor } from "@/lib/types";

function Picker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Opportunity[];
  onChange: (slug: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-eyebrow uppercase" style={{ color: "var(--fg-faint)" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full cursor-pointer rounded-[var(--radius-brand)] border px-3 py-2.5 text-sm outline-none"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--fg)" }}
      >
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CompareTool({
  opportunities,
  scoringFactors,
}: {
  opportunities: Opportunity[];
  scoringFactors: ScoringFactor[];
}) {
  const [leftSlug, setLeftSlug] = useState(opportunities[0]?.slug ?? "");
  const [rightSlug, setRightSlug] = useState(opportunities[1]?.slug ?? "");

  const left = opportunities.find((o) => o.slug === leftSlug);
  const right = opportunities.find((o) => o.slug === rightSlug);
  if (!left || !right) return null;

  const rows = [
    { label: "Overall Score", left: left.score, right: right.score, badge: true },
    { label: "Startup Cost", left: moneyRange(left.startupCost), right: moneyRange(right.startupCost) },
    { label: "Profit / Month", left: moneyRange(left.monthlyProfit), right: moneyRange(right.monthlyProfit) },
    { label: "Time / Week", left: hoursRange(left.hoursPerWeek), right: hoursRange(right.hoursPerWeek) },
    { label: "Flexibility", left: left.flexibilityLabel, right: right.flexibilityLabel },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Picker label="Option A" value={leftSlug} options={opportunities} onChange={setLeftSlug} />
        <Picker label="Option B" value={rightSlug} options={opportunities} onChange={setRightSlug} />
      </div>

      <div
        className="mt-6 overflow-x-auto rounded-[var(--radius-brand)] border"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">
            {left.name} compared with {right.name}
          </caption>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)" }}>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
                Measure
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">{left.name}</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">{right.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t" style={{ borderColor: "var(--border)" }}>
                <th scope="row" className="px-4 py-3 text-left font-medium" style={{ color: "var(--fg-muted)" }}>
                  {row.label}
                </th>
                <td className="px-4 py-3 tabular-nums">
                  {row.badge ? <ScoreBadge score={row.left as number} /> : row.left}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {row.badge ? <ScoreBadge score={row.right as number} /> : row.right}
                </td>
              </tr>
            ))}

            {scoringFactors.map((factor) => {
              const a = left.factors[factor.key];
              const b = right.factors[factor.key];
              return (
                <tr key={factor.key} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <th scope="row" className="px-4 py-3 text-left font-medium" style={{ color: "var(--fg-muted)" }}>
                    {factor.label}
                  </th>
                  {[a, b].map((value, index) => (
                    <td key={index} className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-20 overflow-hidden rounded-full"
                          style={{ backgroundColor: "var(--bg-inset)" }}
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${value}%`,
                              backgroundColor:
                                value === Math.max(a, b) && a !== b ? "var(--accent)" : "var(--border-strong)",
                            }}
                          />
                        </span>
                        <span className="tabular-nums">{value}</span>
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm" style={{ color: "var(--fg-muted)" }}>
        {left.score === right.score
          ? `${left.name} and ${right.name} score identically overall — the difference is in which factors carry the score.`
          : `${left.score > right.score ? left.name : right.name} scores ${Math.abs(left.score - right.score)} points higher overall.`}
      </p>
    </div>
  );
}
