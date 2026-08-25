# Opportunity Index

The independent index of side hustles, businesses, franchises, and acquisition
opportunities — every entry scored on the same six factors.

**Find. Evaluate. Build. Grow.**

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4, CSS-first config with brand tokens |
| Type | Space Grotesk via `next/font/google` |
| Data | Typed seed modules under `src/data`, read through `src/lib/queries.ts` |

No runtime dependencies beyond Next and React — the horizon artwork, the OI
monogram, and every icon are inline SVG or CSS, so there are no image requests
on any page.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Design system

Brand tokens live at the top of `src/app/globals.css`:

| Token | Hex | Name |
| --- | --- | --- |
| `--color-space` | `#0D1117` | Space Black |
| `--color-slate-deep` | `#1A1F2B` | Deep Slate |
| `--color-horizon` | `#2563EB` | Horizon Blue |
| `--color-mist` | `#F5F7FA` | Light Gray |

Everything the UI paints goes through semantic variables (`--bg`, `--fg`,
`--border`, `--accent`, …) that are redefined under `.dark`. The theme is set on
`<html>` before first paint by an inline script, and `ThemeToggle` reads it with
`useSyncExternalStore` so the server render and the first client render agree.

## Scoring

Every score on the site comes from one function — `overallScore()` in
`src/lib/scoring.ts` — so a number on a card can never drift from the number on
a detail page. It is a weighted blend of six factors, each rated 0–100 where
higher is always better for the operator:

| Factor | Weight |
| --- | --- |
| Market Demand | 25% |
| Profit Potential | 22% |
| Low Startup Cost | 18% |
| Speed to Revenue | 15% |
| Scalability | 12% |
| Competitive Room | 8% |

Weights are declared once in `SCORE_FACTORS` (`src/lib/types.ts`) and are read by
the scorer, the detail-page breakdown, the compare tool, and `/methodology`, so
the published formula and the computed one cannot diverge.

## Routes

```
/                            Homepage — hero, category rail, ranked index
/hustles                     Full index with filters and sorting
/hustles/[slug]              Opportunity detail + score breakdown
/businesses                  Category overview
/businesses/[category]       Filtered index per category
/businesses-for-sale[/slug]  Acquisition listings
/franchises[/slug]           Franchise concepts
/funding[/slug]              Funding routes compared
/research[/slug]             Reports, guides, data studies
/tools                       Startup cost · break-even · compare
/about /methodology /advertise /contact /newsletter
/privacy /terms /disclaimer
```

Filters, search, and sort are held in the URL and applied on the server, so any
filtered view is shareable, survives a refresh, and renders without JavaScript.

## Advertising

`AdSlot` renders labelled, correctly-sized placeholders at each IAB format
(728×90, 300×600, 300×250) so no layout shifts when real creative is dropped in.
Sponsored placements are visually distinct and labelled. No placement can affect
a score, a rank, or inclusion — stated on `/methodology` and `/advertise`, and
true in the code: no scoring input references advertising.

## Data

Figures are researched estimates for a typical solo operator in a mid-sized US
market, not guarantees. Counts shown in the UI are computed from the actual
dataset rather than hard-coded, so nothing on screen claims more coverage than
the index holds.

`src/lib/queries.ts` is the only module the UI reads data through. Swapping the
seed modules for a database is a change to that file and the `src/data` imports;
no page or component reads a dataset directly.
