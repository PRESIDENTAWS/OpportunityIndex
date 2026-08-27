import { Suspense } from "react";
import { FilterRail } from "./FilterRail";
import { MobileFilterButton } from "./MobileFilterButton";
import { CapitalReconCta } from "./CapitalReconCta";
import { OpportunityTable } from "./OpportunityTable";
import { SortSelect } from "./SortSelect";
import { plural } from "@/lib/format";
import type { Category } from "@/lib/types";
import type { Opportunity } from "@/lib/types";

/**
 * The three-column index view (filters · results · sponsor rail) shared by
 * /hustles and every category page.
 */
export function IndexLayout({
  results,
  categories,
}: {
  results: Opportunity[];
  categories: Category[];
}) {
  return (
    <div className="container-oi grid gap-6 py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside
        className="hidden self-start rounded-[var(--radius-brand)] border p-4 lg:block"
        style={{ borderColor: "var(--border)" }}
      >
        <Suspense fallback={null}>
          <FilterRail categories={categories} />
        </Suspense>
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "var(--fg-faint)" }}>
            {plural(results.length, "opportunity", "opportunities")} found
          </p>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <Suspense fallback={null}>
              <MobileFilterButton categories={categories} />
              <SortSelect />
            </Suspense>
          </div>
        </div>

        <OpportunityTable opportunities={results} />

        {results.length > 0 && <CapitalReconCta variant="inline" className="mt-6" />}
      </div>

    </div>
  );
}
