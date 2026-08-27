"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import {
  DEFAULT_MATCH_INPUT,
  type LocationPreference,
  type MatchInput,
} from "@/lib/matching";

/**
 * The matching form.
 *
 * Submits to the same page as query parameters rather than holding results in
 * component state, so a matched result set is shareable, survives a refresh,
 * and is rendered on the server.
 *
 * Four inputs, deliberately. Experience level is absent because no opportunity
 * record carries a difficulty rating — see /methodology.
 */

const LOCATION_OPTIONS: { value: LocationPreference; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "local", label: "Local" },
  { value: "either", label: "Either" },
];

function Field({
  id,
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1.5">
        {prefix && (
          <span
            className="absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            style={{ color: "var(--fg-faint)" }}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          className={`w-full rounded-[var(--radius-brand)] border py-2.5 text-sm tabular-nums outline-none ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-14" : "pr-3"}`}
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-strong)" }}
        />
        {suffix && (
          <span
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs"
            style={{ color: "var(--fg-faint)" }}
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function MatchForm({ initial }: { initial?: MatchInput }) {
  const router = useRouter();
  const start = initial ?? DEFAULT_MATCH_INPUT;

  const [capital, setCapital] = useState(String(start.capital));
  const [hours, setHours] = useState(String(start.hoursPerWeek));
  const [goal, setGoal] = useState(String(start.monthlyIncomeGoal));
  const [location, setLocation] = useState<LocationPreference>(start.locationPreference);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      capital: capital || "0",
      hours: hours || "1",
      goal: goal || "0",
      loc: location,
    });
    router.push(`/?${params.toString()}#results`, { scroll: true });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-brand)] border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      <h2 className="text-base font-semibold">Find your match</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
        Four questions. We rank all opportunities against your answers.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          id="capital"
          label="Capital available"
          prefix="$"
          hint="What you can put in to start."
          value={capital}
          onChange={setCapital}
        />
        <Field
          id="hours"
          label="Hours per week"
          suffix="hrs"
          hint="Time you can commit."
          value={hours}
          onChange={setHours}
        />
        <Field
          id="goal"
          label="Monthly income goal"
          prefix="$"
          hint="What you want it to earn."
          value={goal}
          onChange={setGoal}
        />

        <fieldset>
          <legend className="text-sm font-medium">Where you want to work</legend>
          <div className="mt-1.5 flex gap-2">
            {LOCATION_OPTIONS.map((option) => {
              const active = location === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLocation(option.value)}
                  aria-pressed={active}
                  className="flex-1 rounded-[var(--radius-brand)] border px-2 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    borderColor: active ? "transparent" : "var(--border-strong)",
                    backgroundColor: active ? "var(--bg-inverse)" : "transparent",
                    color: active ? "var(--fg-inverse)" : "var(--fg-muted)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>
            Online is remote-friendly work; Local is work rooted in your area.
          </p>
        </fieldset>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-brand)] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 sm:w-auto"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
      >
        Show my matches
        <Icon name="arrowRight" size={16} />
      </button>
    </form>
  );
}
