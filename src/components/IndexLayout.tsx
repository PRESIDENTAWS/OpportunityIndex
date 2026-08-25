import { Suspense } from "react";
import { AdSlot } from "./AdSlot";
import { FilterRail } from "./FilterRail";
import { MobileFilterButton } from "./MobileFilterButton";
import { NewsletterCard } from "./NewsletterCard";
import { OpportunityTable } from "./OpportunityTable";
import { SortSelect } from "./SortSelect";
import { SponsorCard, SPONSORS } from "./SponsorCard";
import { plural } from "@/lib/format";
import type { ScoredOpportunity } from "@/lib/queries";

/**
 * The three-column index view (filters · results · sponsor rail) shared by
 * /hustles and every category page.
 */
export function IndexLayout({ results }: { results: ScoredOpportunity[] }) {
  return (
    <div className="container-oi grid gap-6 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] 2xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
      <aside
        className="hidden self-start rounded-[var(--radius-brand)] border p-4 lg:block"
        style={{ borderColor: "var(--border)" }}
      >
        <Suspense fallback={null}>
          <FilterRail />
        </Suspense>
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "var(--fg-faint)" }}>
            {plural(results.length, "opportunity", "opportunities")} found
          </p>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <Suspense fallback={null}>
              <MobileFilterButton />
              <SortSelect />
            </Suspense>
          </div>
        </div>

        <OpportunityTable opportunities={results} adEvery={15} />
      </div>

      <aside className="space-y-4">
        <SponsorCard sponsor={SPONSORS.capitalRecon} />
        <AdSlot format="half-page" className="hidden 2xl:flex" />
        <NewsletterCard />
      </aside>
    </div>
  );
}
