# Opportunity Index

The independent index of side hustles, businesses, franchises, and acquisition
opportunities — every entry scored on the same six factors, with the formula
published.

**Find. Evaluate. Build. Grow.**

---

## What is in this repository

| Path | What it is |
| --- | --- |
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | What the product is, who it serves, and what it deliberately is not |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | **The contract.** Conventions, enums, the scoring model, table-by-table detail, and the rules client code must follow |
| [`docs/LAUNCH_PLAN.md`](docs/LAUNCH_PLAN.md) | Phased plan, sequenced by dependency |
| [`supabase/schema.sql`](supabase/schema.sql) | Canonical PostgreSQL schema: tables, enums, constraints, indexes, RLS, triggers |
| [`supabase/seed.sql`](supabase/seed.sql) | Reference data and seed content; idempotent |
| [`data/opportunities.seed.json`](data/opportunities.seed.json) | Canonical opportunity dataset, 26 records |
| [`.env.example`](.env.example) | Environment template |

`supabase/schema.sql` and `docs/DATA_MODEL.md` are the contract. Application
code conforms to them, not the reverse. Where the document and the schema
disagree, the schema wins — it is the executable artifact.

## Getting a database up

Requires PostgreSQL 16 or later. **Run from the repository root** — `seed.sql`
reads `data/opportunities.seed.json` by relative path.

```bash
createdb opportunity_index
export DATABASE_URL=postgresql://localhost/opportunity_index

psql "$DATABASE_URL" -f supabase/schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

You should end up with:

| Table | Rows |
| --- | --- |
| `categories` | 5 |
| `scoring_factors` | 6 |
| `opportunities` | 26 |
| `opportunity_steps` | 130 |
| `business_listings` | 6 |
| `franchises` | 6 |
| `funding_programs` | 6 |
| `research_pieces` | 6 |

Re-running `seed.sql` is safe: every insert upserts on its natural key, so it
refreshes content rather than duplicating or failing.

## The scoring model

Six factors, each `0..100`, where **higher is always better for the operator** —
so a high "Low Startup Cost" score means cheap to start, and a high "Competitive
Room" score means the field is *not* crowded.

| Factor | Weight |
| --- | --- |
| Market Demand | 25% |
| Profit Potential | 22% |
| Low Startup Cost | 18% |
| Speed to Revenue | 15% |
| Scalability | 12% |
| Competitive Room | 8% |

`opportunities.overall_score` is a **generated column**. No client can write it,
so a published score can never disagree with the factors behind it. A constraint
trigger holds the weights in `scoring_factors` to a sum of exactly `1.000`.

Read the score. Never recompute it client-side.

## Security posture

Row Level Security is enabled on every table.

- Anonymous and authenticated callers read **published rows only**.
- Anonymous callers cannot write any content.
- Newsletter signup is the single permitted anonymous write, and there is
  deliberately no read policy — the subscriber list is not retrievable through
  the public API.
- All content writes go through `service_role`.

`SUPABASE_SECRET_KEY` bypasses RLS entirely. It is server-only: never prefixed
with `NEXT_PUBLIC_`, never imported into a client component, never logged.

## Verification

The schema and seed are validated against a real PostgreSQL 16 instance, not
just reviewed. The invariants that must keep passing are listed in
[DATA_MODEL.md § Verification](docs/DATA_MODEL.md#verification) and cover clean
application, expected row counts, seed idempotency, weight sum, score
correctness, RLS behaviour for anonymous callers, and constraint enforcement.

There is **no automated test suite in this repository yet**. CI arrives in
Phase 3 of the launch plan. Until it exists, no claim that "tests pass" is
meaningful here.

## Branches

| Branch | Owns |
| --- | --- |
| `codex/foundation` | This contract: docs, schema, seed data |
| `claude/frontend` | The Next.js application |

The frontend was built before this contract existed and holds equivalent data in
TypeScript modules with different names and shapes. Reconciling it is **Phase 1**
of the launch plan, which lists the known divergences.

## Data honesty

Cost, profit, and time figures are researched estimates for a typical solo
operator in a mid-sized US market. They are not guarantees, not survey averages,
and not projections for any individual.

Acquisition listings, franchise terms, and lending rates are supplied by third
parties. Inclusion is not verification.

Counts shown to readers are derived from the data. If the index holds 26 models,
the interface says 26.
