"use client";

import { useState } from "react";
import { FilterRail } from "./FilterRail";
import type { Category } from "@/lib/types";
import { Icon } from "./Icon";

/** Opens the filter rail as a bottom sheet on small screens. */
export function MobileFilterButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center gap-2 rounded-[var(--radius-brand)] border px-4 py-2.5 text-sm font-medium lg:hidden"
        style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--bg)" }}
      >
        <Icon name="filter" size={17} />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <div
            className="max-h-[80vh] overflow-y-auto rounded-t-2xl border-t p-5"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
          >
            <FilterRail categories={categories} variant="sheet" onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
