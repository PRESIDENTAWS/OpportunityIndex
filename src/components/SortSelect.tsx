"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/sort-options";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") ?? "score";

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Sort by</span>
      <select
        value={current}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          if (event.target.value === "score") next.delete("sort");
          else next.set("sort", event.target.value);
          const query = next.toString();
          router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        }}
        className="cursor-pointer rounded-[var(--radius-brand)] border px-3 py-2 text-sm outline-none"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--fg)" }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            Sort: {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
