# Launch Plan

Sequenced by dependency, not by date. Each phase lists what must be true before
the next one starts.

---

## Phase 0 — Foundation ✅

**This branch.**

- Product spec, data model contract, launch plan
- PostgreSQL schema: tables, enums, constraints, indexes, RLS, triggers
- Canonical seed dataset (26 opportunities) plus reference and secondary data
- Environment variable template

**Done when:** schema and seed apply cleanly to a real PostgreSQL instance, the
seed is idempotent, and RLS behaves as documented. *(Verified — see
[DATA_MODEL.md § Verification](DATA_MODEL.md#verification).)*

---

## Phase 1 — Frontend reconciliation

The frontend exists on `claude/frontend` and was built before this contract. It
holds equivalent data in TypeScript modules with different names and shapes.

**Work:**

- Reconcile `src/lib/types.ts`, `scoring.ts`, `queries.ts`, and `src/data/*`
  against this contract. Known divergences to expect:
  - Category slugs: `e-commerce` → `ecommerce`, `local-business` → `local`
  - `flexibility` values become lowercase enum labels
  - `research_kind` becomes `data_study`, not `Data Study`
  - `updated` becomes `reviewed_at`
  - Score is read from `overall_score`, never recomputed client-side
  - Range objects flatten to `*_min` / `*_max` / `*_open_ended`
  - Steps carry an explicit `position`
- Remove every direct `@/data/*` import from pages and components; all domain
  data flows through the repository layer.
- Keep the frontend on fixtures for now. No database connection in this phase —
  the point is to make the shapes correct while they are still cheap to change.

**Done when:** the app builds, typechecks, and lints clean, no page imports a
dataset directly, and no invented field, category, or weight survives.

**Explicitly not in this phase:** Supabase connectivity, authentication, CI.

---

## Phase 2 — Data layer

- Provision the Supabase project; apply `schema.sql` and `seed.sql`.
- Generate types from the live schema and check them in.
- Implement the repository layer against the database, keeping the fixture
  implementation behind the same interface for tests and offline development.
- Verify RLS from a real anonymous client, not just from `psql`.

**Done when:** every page renders from the database, and an anonymous client can
be shown to read only published rows.

**Risk to watch:** RLS that passes as `set role anon` but fails through PostgREST.
Test through the actual client before believing it.

---

## Phase 3 — Continuous integration

Deliberately after Phase 2, so CI is written against a stack that has settled.

- Workflow on pull requests: install, lint, typecheck, build.
- A schema job that applies `schema.sql` and `seed.sql` to a disposable
  PostgreSQL service and asserts the invariants in
  [DATA_MODEL.md § Verification](DATA_MODEL.md#verification).
- First real test suite. Until one exists, no document or PR may claim tests
  pass — absence of CI is not a passing build.

**Done when:** a red build blocks a merge.

---

## Phase 4 — Content and operations

- Editorial pass over all 26 opportunities; confirm every figure and set
  `reviewed_at` honestly.
- Newsletter provider wired to `newsletter_subscribers`, with double opt-in.
- Corrections workflow: an inbound route, an owner, and a turnaround target.
- Quarterly review cadence agreed and documented.

**Done when:** a wrong number has a named path to being fixed within a week.

---

## Phase 5 — Public launch

- Domain, analytics, error monitoring.
- Sitemap and robots verified against the live host.
- Sponsor placements sold and trafficked; labelling audited on every surface.
- Legal pages reviewed by counsel — particularly the disclaimer, given the
  financial subject matter.

**Done when:** the site is indexed, monitored, and someone is on call for it.

---

## Sequencing constraints

These are the orderings that actually matter:

| Constraint | Why |
| --- | --- |
| Contract before reconciliation | Reconciling against an unwritten contract means inventing one |
| Reconciliation before database | Fix shapes while they are still fixtures and changes are cheap |
| Database before CI | CI written against a moving stack gets rewritten |
| CI before content scale | Manual verification stops working past a few dozen records |
| Everything before launch | Corrections need a path before there are readers to correct for |

## Open questions

Flagged rather than silently decided:

1. **Listing supply.** Acquisition listings are seeded illustratively. Real
   listings need either broker feeds or a submission workflow with vetting. Which?
2. **Review cadence at scale.** Quarterly review is feasible for 26 models and
   not for 500. What triggers a re-score — time, or a signal?
3. **Score revisions.** When a score moves, do readers see the history? Showing
   it supports the transparency claim; hiding it is simpler.
4. **Saved shortlists.** The frontend has a `/saved` placeholder. This needs
   authentication, which is a larger commitment than it appears.
