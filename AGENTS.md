# Agent Engineering Contract

This repository is developed by humans and coding agents. The rules in this file are binding for all automated contributors unless a more specific file in a subdirectory overrides them.

## Source-of-truth order

1. `supabase/schema.sql` and applied migrations under `supabase/migrations/`
2. `data/opportunities.seed.json`
3. `docs/DATA_MODEL.md`
4. `docs/design/`
5. Existing repository abstractions and public interfaces

If two sources disagree, do not silently choose. Preserve the executable database contract and document the discrepancy in the PR.

## Non-negotiable engineering rules

- Never duplicate scoring logic in a second client or server implementation.
- Never write `opportunities.overall_score` directly. It is database-generated.
- Keep personal Match Score separate from Opportunity Score. Never blend them into one number.
- Never invent user counts, revenue, ratings, opportunity counts, conversion rates, sponsor relationships, or performance claims.
- Earnings, startup cost, and timing ranges are informational estimates, not guarantees.
- Do not change canonical slugs without an explicit migration and redirect strategy.
- Do not create a second repository/data-access layer beside `src/lib/repository.ts` without an approved architecture change.
- Do not expose Supabase service-role/secret credentials to browser code or `NEXT_PUBLIC_*` variables.
- Do not enable affiliate conversion adapters until their official webhook specifications have been verified and the implementation gate is intentionally removed.
- Paid placement, affiliate commission, or funding relationships must never affect editorial scoring.
- Do not implement Figma-only future features with fabricated backend state. Use honest empty, planned, disabled, or gated states.
- Preserve accessibility, keyboard operation, responsive behavior, and no-horizontal-overflow requirements.

## Git workflow

- `main` is release history, not a development workspace.
- Use one focused feature branch per change.
- Do not overwrite another agent's active branch.
- Prefer additive migrations. Never rewrite an already-applied migration to change production behavior.
- Open a PR into `main`; do not merge unrelated product areas in one PR.
- Before asking for merge, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI is the merge gate once `.github/workflows/ci.yml` is active.

## Database workflow

For a clean local verification database, apply in order:

```bash
psql "$DATABASE_URL" -f supabase/schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql
psql "$DATABASE_URL" -f supabase/migrations/0001_monetization.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_scoring_model.sql
```

`0002_scoring_model.sql` defines the active five-factor MVP score. The original six-factor definitions in the base schema/seed are historical setup state and are replaced by this migration.

## Product implementation order

Unless a PR explicitly changes priorities, build in this order:

1. CI and merge discipline
2. Supabase-backed repository implementation
3. Expand the canonical opportunity dataset with sourced editorial data
4. Core Figma alignment
5. Comparison engine
6. Accounts and saved opportunities
7. Pro workspace and monetization
8. Marketplace transactions
9. Admin operations
10. AI agents
11. Public research/data products

## Figma

The design files are a product architecture reference, not permission to ship every concept immediately. See `docs/design/FIGMA_INDEX.md` and `docs/design/IMPLEMENTATION_STATUS.md` before implementing a screen.

When code and Figma disagree, identify whether the Figma screen is `NOW`, `NEXT`, or `LATER` in the implementation-status document before changing code.
