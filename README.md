# Opportunity Index

A decision engine for finding what to build, buy, start, or invest in next.

**Find. Evaluate. Build. Grow.**

The public site is configured through `NEXT_PUBLIC_SITE_URL`; the current production fallback is `https://sidehustleindex.com`.

---

## Repository map

| Path | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Engineering contract for human and AI contributors |
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Product scope and non-goals |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Data contract and conventions |
| [`docs/LAUNCH_PLAN.md`](docs/LAUNCH_PLAN.md) | Original dependency-based launch plan |
| [`docs/design/FIGMA_INDEX.md`](docs/design/FIGMA_INDEX.md) | Figma files mapped to code ownership |
| [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) | Visual/product implementation rules |
| [`docs/design/PRODUCT_ROADMAP.md`](docs/design/PRODUCT_ROADMAP.md) | Current phased product roadmap |
| [`docs/design/IMPLEMENTATION_STATUS.md`](docs/design/IMPLEMENTATION_STATUS.md) | What is real vs designed vs planned |
| [`supabase/schema.sql`](supabase/schema.sql) | Canonical base PostgreSQL schema |
| [`supabase/seed.sql`](supabase/seed.sql) | Base reference and seed content |
| [`supabase/migrations/`](supabase/migrations/) | Additive migrations, including the active scoring model |
| [`data/opportunities.seed.json`](data/opportunities.seed.json) | Canonical opportunity dataset; currently 26 records |
| [`src/lib/repository.ts`](src/lib/repository.ts) | Single application data-access boundary |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Automated app and PostgreSQL contract checks |

The executable database contract is the base schema plus migrations applied in order. Application code conforms to that contract, not the reverse.

## Local setup

Requires Node 22+ and PostgreSQL 16+.

```bash
npm ci
npm run dev
```

For a clean database, run from the repository root because `seed.sql` reads `data/opportunities.seed.json` by relative path:

```bash
createdb opportunity_index
export DATABASE_URL=postgresql://localhost/opportunity_index

psql "$DATABASE_URL" -f supabase/schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql
psql "$DATABASE_URL" -f supabase/migrations/0001_monetization.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_scoring_model.sql
```

`0002_scoring_model.sql` is required. The base schema/seed contain the original six-factor launch model; migration `0002` replaces the published score with the active five-factor MVP model.

## Active scoring model

Opportunity Score describes the opportunity itself. Match Score describes fit against a user's constraints. They are intentionally separate and must never be blended.

The active Opportunity Score after migration `0002` is:

| Factor | Weight |
| --- | ---: |
| Income Potential | 27.8% |
| Startup Affordability | 22.2% |
| Speed to First Revenue | 22.2% |
| Demand Durability | 16.7% |
| Flexibility | 11.1% |

`opportunities.overall_score` is a stored generated column. Clients do not write it directly.

Flexibility is derived from the canonical enum in the generated expression:

- `anywhere` → 100
- `remote` → 70
- `local` → 30

Operational simplicity and experience fit are not currently scored because the canonical dataset does not yet contain defensible ratings for those dimensions.

## Verification

Run locally before opening or updating a PR:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The repository currently contains a substantial Vitest suite; the lean-MVP branch reported 160 passing tests at its latest local verification. Treat that as historical verification, not a substitute for CI on the current commit.

GitHub Actions is defined in `.github/workflows/ci.yml` and checks both the application and a disposable PostgreSQL 16 database. A green CI run is the authoritative automated merge signal once the workflow executes.

## Security posture

- Row Level Security is enabled on public-facing data tables.
- Anonymous/authenticated clients read published content only where policies allow it.
- Service-role/secret Supabase credentials are server-only.
- Monetization tables are not public read/write surfaces.
- Affiliate conversion adapters remain disabled until official webhook specifications are verified.
- Paid commercial relationships must never modify editorial scoring.

## Data honesty

Cost, income, and timing figures are researched/editorial ranges, not guarantees.

Counts shown to users must derive from actual data. Do not ship Figma placeholder numbers, fake ratings, fabricated user totals, unsupported “#1” claims, or unverified partner claims.

Business listings, franchise terms, funding information, and third-party claims require clear provenance and must not be presented as independently verified unless a verification process actually exists.

## Development workflow

`main` is release history. Develop on focused feature branches and open pull requests.

Current priority after the lean MVP is merged:

```text
CI → Supabase → dataset expansion → core UI alignment → compare → accounts/saved → Pro → monetization → marketplace → admin → AI → public data products
```

See `AGENTS.md` for contributor rules and `docs/design/IMPLEMENTATION_STATUS.md` before implementing future-state Figma screens.
