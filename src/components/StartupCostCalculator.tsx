"use client";

import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { money } from "@/lib/format";

interface LineItem {
  id: number;
  label: string;
  amount: string;
}

const STARTING_ITEMS: LineItem[] = [
  { id: 1, label: "Equipment & tools", amount: "2500" },
  { id: 2, label: "Licences & registration", amount: "400" },
  { id: 3, label: "Insurance (first year)", amount: "900" },
  { id: 4, label: "Initial inventory or materials", amount: "1200" },
  { id: 5, label: "Website & branding", amount: "800" },
  { id: 6, label: "Marketing to first customers", amount: "600" },
];

export function StartupCostCalculator() {
  const [items, setItems] = useState<LineItem[]>(STARTING_ITEMS);
  const [nextId, setNextId] = useState(STARTING_ITEMS.length + 1);
  const [contingency, setContingency] = useState(20);
  const [monthlyBurn, setMonthlyBurn] = useState("1400");
  const [runwayMonths, setRunwayMonths] = useState(3);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [items],
  );
  const buffer = Math.round(subtotal * (contingency / 100));
  const runway = (Number(monthlyBurn) || 0) * runwayMonths;
  const total = subtotal + buffer + runway;

  function update(id: number, patch: Partial<LineItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <h2 className="text-sm font-bold">One-off costs</h2>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2">
              <input
                aria-label="Cost description"
                value={item.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                className="min-w-0 flex-1 rounded-[var(--radius-brand)] border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              />
              <div className="relative w-32 shrink-0">
                <span
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-sm"
                  style={{ color: "var(--fg-faint)" }}
                >
                  $
                </span>
                <input
                  aria-label={`Amount for ${item.label}`}
                  inputMode="numeric"
                  value={item.amount}
                  onChange={(e) => update(item.id, { amount: e.target.value.replace(/[^0-9]/g, "") })}
                  className="w-full rounded-[var(--radius-brand)] border py-2 pr-3 pl-6 text-sm tabular-nums outline-none"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((i) => i.id !== item.id))}
                aria-label={`Remove ${item.label}`}
                className="shrink-0 rounded-[var(--radius-brand)] border px-2.5"
                style={{ borderColor: "var(--border)", color: "var(--fg-faint)" }}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            setItems((current) => [...current, { id: nextId, label: "New cost", amount: "0" }]);
            setNextId((n) => n + 1);
          }}
          className="mt-3 rounded-[var(--radius-brand)] border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "var(--border-strong)" }}
        >
          + Add a line
        </button>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">
              Contingency: <span className="tabular-nums">{contingency}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={contingency}
              onChange={(e) => setContingency(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
            <span className="mt-1 block text-xs" style={{ color: "var(--fg-faint)" }}>
              First-time owners typically overrun by 15-25%.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Personal runway: <span className="tabular-nums">{runwayMonths} months</span>
            </span>
            <input
              type="range"
              min={0}
              max={12}
              value={runwayMonths}
              onChange={(e) => setRunwayMonths(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
            <span className="mt-1 mb-1 block text-xs" style={{ color: "var(--fg-faint)" }}>
              Living costs while revenue ramps.
            </span>
            <div className="relative">
              <span
                className="absolute top-1/2 left-3 -translate-y-1/2 text-sm"
                style={{ color: "var(--fg-faint)" }}
              >
                $
              </span>
              <input
                aria-label="Monthly living costs"
                inputMode="numeric"
                value={monthlyBurn}
                onChange={(e) => setMonthlyBurn(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full rounded-[var(--radius-brand)] border py-2 pr-3 pl-6 text-sm tabular-nums outline-none"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              />
            </div>
          </label>
        </div>
      </div>

      <aside
        className="self-start rounded-[var(--radius-brand)] border p-5"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}
      >
        <h2 className="text-sm font-bold">What you actually need</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["One-off costs", money(subtotal)],
            [`Contingency (${contingency}%)`, money(buffer)],
            [`Runway (${runwayMonths} mo)`, money(runway)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt style={{ color: "var(--fg-muted)" }}>{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
          <div
            className="flex justify-between gap-3 border-t pt-3"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <dt className="font-bold">Total to launch</dt>
            <dd className="text-lg font-bold tabular-nums">{money(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs" style={{ color: "var(--fg-faint)" }}>
          Nothing is stored — this runs entirely in your browser.
        </p>
      </aside>
    </div>
  );
}
