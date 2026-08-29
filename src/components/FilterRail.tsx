"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Icon } from "./Icon";
import {
  COST_BANDS,
  FLEXIBILITY_VALUES,
  flexibilityLabel,
  INCOME_BANDS,
  TIME_BANDS,
} from "@/lib/filter-options";
import type { Category } from "@/lib/types";

interface FilterRailProps {
  /** Passed in by the page: a client component performs no data access. */
  categories: Category[];
  /** Rendered inside a mobile sheet rather than the desktop rail. */
  variant?: "rail" | "sheet";
  onDone?: () => void;
}

/**
 * Filters are held in the URL, so a filtered view is shareable, survives a
 * refresh, and can be rendered on the server.
 */
export function FilterRail({ categories, variant = "rail", onDone }: FilterRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeSearch = params.get("q") ?? "";

  const commit = useCallback(
    (next: URLSearchParams) => {
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    next.delete(key);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updated.forEach((v) => next.append(key, v));
    commit(next);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = new FormData(event.currentTarget).get("q");
    const term = typeof entered === "string" ? entered.trim() : "";
    const next = new URLSearchParams(params.toString());
    if (term) next.set("q", term);
    else next.delete("q");
    commit(next);
    onDone?.();
  }

  const isChecked = (key: string, value: string) => params.getAll(key).includes(value);
  const activeCount =
    ["category", "cost", "income", "time", "flex"].reduce(
      (sum, key) => sum + params.getAll(key).length,
      0,
    ) + (params.get("q") ? 1 : 0);

  return (
    <div className={variant === "rail" ? "" : "pb-4"}>
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] font-semibold tracking-eyebrow uppercase">Filters</h2>
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            ["category", "cost", "income", "time", "flex", "q"].forEach((k) =>
              next.delete(k),
            );
            commit(next);
          }}
          className="text-xs underline underline-offset-4 disabled:opacity-40"
          style={{ color: "var(--fg-muted)" }}
          disabled={activeCount === 0}
        >
          Reset All
        </button>
      </div>

      <form onSubmit={submitSearch} className="mt-4">
        <label htmlFor={`filter-search-${variant}`} className="mb-2 block text-xs font-semibold">
          Search
        </label>
        <div className="relative">
          <input
            key={activeSearch}
            id={`filter-search-${variant}`}
            name="q"
            type="search"
            defaultValue={activeSearch}
            placeholder="Search opportunities…"
            className="w-full rounded-[var(--radius-brand)] border py-2 pr-9 pl-3 text-sm outline-none"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-strong)" }}
          />
          <button
            type="submit"
            aria-label="Apply search"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            style={{ color: "var(--fg-faint)" }}
          >
            <Icon name="search" size={16} />
          </button>
        </div>
      </form>

      <FilterGroup title="Category">
        {categories.map((category) => (
          <Checkbox
            key={category.slug}
            label={category.label}
            checked={isChecked("category", category.slug)}
            onChange={() => toggle("category", category.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Startup Cost">
        {COST_BANDS.map((band) => (
          <Checkbox
            key={band.id}
            label={band.label}
            checked={isChecked("cost", band.id)}
            onChange={() => toggle("cost", band.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Income Potential">
        {INCOME_BANDS.map((band) => (
          <Checkbox
            key={band.id}
            label={band.label}
            checked={isChecked("income", band.id)}
            onChange={() => toggle("income", band.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Time Required">
        {TIME_BANDS.map((band) => (
          <Checkbox
            key={band.id}
            label={band.label}
            checked={isChecked("time", band.id)}
            onChange={() => toggle("time", band.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Location">
        {FLEXIBILITY_VALUES.map((option) => (
          <Checkbox
            key={option}
            label={flexibilityLabel(option)}
            checked={isChecked("flex", option)}
            onChange={() => toggle("flex", option)}
          />
        ))}
      </FilterGroup>

      {variant === "sheet" && (
        <button
          type="button"
          onClick={onDone}
          className="mt-6 w-full rounded-[var(--radius-brand)] py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
        >
          Show results
        </button>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-2 text-xs font-semibold">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span style={{ color: checked ? "var(--fg)" : "var(--fg-muted)" }}>{label}</span>
    </label>
  );
}
