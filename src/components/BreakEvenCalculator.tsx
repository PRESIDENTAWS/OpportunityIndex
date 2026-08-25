"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/format";

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative mt-1.5 block">
        {prefix && (
          <span
            className="absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            style={{ color: "var(--fg-faint)" }}
          >
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          className={`w-full rounded-[var(--radius-brand)] border py-2.5 text-sm tabular-nums outline-none ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        />
        {suffix && (
          <span
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm"
            style={{ color: "var(--fg-faint)" }}
          >
            {suffix}
          </span>
        )}
      </span>
      {hint && (
        <span className="mt-1 block text-xs" style={{ color: "var(--fg-faint)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState("1800");
  const [price, setPrice] = useState("150");
  const [variableCost, setVariableCost] = useState("40");
  const [startupCost, setStartupCost] = useState("6000");
  const [salesPerMonth, setSalesPerMonth] = useState("14");

  const result = useMemo(() => {
    const p = Number(price) || 0;
    const v = Number(variableCost) || 0;
    const fixed = Number(fixedCosts) || 0;
    const startup = Number(startupCost) || 0;
    const sales = Number(salesPerMonth) || 0;

    const contribution = p - v;
    const marginPct = p > 0 ? (contribution / p) * 100 : 0;
    // Units per month needed simply to cover the fixed cost base.
    const unitsToBreakEven = contribution > 0 ? Math.ceil(fixed / contribution) : null;
    const monthlyProfit = sales * contribution - fixed;
    // Months until cumulative profit repays the money put in at the start.
    const monthsToRecoup =
      monthlyProfit > 0 && startup > 0 ? Math.ceil(startup / monthlyProfit) : null;

    return { contribution, marginPct, unitsToBreakEven, monthlyProfit, monthsToRecoup };
  }, [fixedCosts, price, variableCost, startupCost, salesPerMonth]);

  const viable = result.contribution > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label="Price per sale"
          value={price}
          onChange={setPrice}
          prefix="$"
          hint="What one customer pays you."
        />
        <NumberField
          label="Variable cost per sale"
          value={variableCost}
          onChange={setVariableCost}
          prefix="$"
          hint="Materials, fees, and fulfilment for that one sale."
        />
        <NumberField
          label="Fixed costs per month"
          value={fixedCosts}
          onChange={setFixedCosts}
          prefix="$"
          hint="Rent, software, insurance, phone — costs you pay at zero sales."
        />
        <NumberField
          label="Expected sales per month"
          value={salesPerMonth}
          onChange={setSalesPerMonth}
          hint="Be conservative; this is the number people inflate."
        />
        <NumberField
          label="Money invested up front"
          value={startupCost}
          onChange={setStartupCost}
          prefix="$"
          hint="Everything spent before the first sale."
        />
      </div>

      <aside
        className="self-start rounded-[var(--radius-brand)] border p-5"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}
      >
        <h2 className="text-sm font-bold">Results</h2>

        {!viable ? (
          <p className="mt-4 text-sm" style={{ color: "var(--fg-muted)" }}>
            Each sale costs at least as much as it earns. Until the price rises above the
            variable cost, no volume will make this profitable.
          </p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt style={{ color: "var(--fg-muted)" }}>Contribution per sale</dt>
              <dd className="font-medium tabular-nums">{money(result.contribution)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "var(--fg-muted)" }}>Contribution margin</dt>
              <dd className="font-medium tabular-nums">{result.marginPct.toFixed(0)}%</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "var(--fg-muted)" }}>Sales to break even</dt>
              <dd className="font-medium tabular-nums">{result.unitsToBreakEven} / month</dd>
            </div>
            <div
              className="flex justify-between gap-3 border-t pt-3"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <dt className="font-bold">Monthly profit</dt>
              <dd
                className="text-lg font-bold tabular-nums"
                style={{ color: result.monthlyProfit >= 0 ? "var(--score-fg)" : "var(--fg)" }}
              >
                {money(Math.round(result.monthlyProfit))}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "var(--fg-muted)" }}>Payback on startup cost</dt>
              <dd className="font-medium tabular-nums">
                {result.monthsToRecoup ? `${result.monthsToRecoup} months` : "Not at this volume"}
              </dd>
            </div>
          </dl>
        )}

        <p className="mt-4 text-xs" style={{ color: "var(--fg-faint)" }}>
          Nothing is stored — this runs entirely in your browser.
        </p>
      </aside>
    </div>
  );
}
