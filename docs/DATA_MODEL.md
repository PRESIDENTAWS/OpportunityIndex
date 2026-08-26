# Data Model

This document and [`supabase/schema.sql`](../supabase/schema.sql) are the
contract. Application code conforms to them; they do not conform to
application code. Where this document and the schema disagree, **the schema
wins** — it is the executable artifact.

Contract version: **1.0.0**

---

## Conventions

These hold everywhere, without exception.

| Rule | Detail |
| --- | --- |
| Identifiers | `snake_case`, always |
| Primary keys | `uuid` with `gen_random_uuid()`, except reference tables keyed by their natural slug |
| Money | `integer`, **whole US dollars** — never cents, never floating point |
| Ranges | Two columns, `*_min` and `*_max`, with a `CHECK (min <= max)` |
| Open-ended ranges | A `*_open_ended boolean`; when true the UI renders the maximum as `$X+`, meaning *at least*, not *unbounded* |
| Enums | Postgres enum types, labels lowercase `snake_case` |
| Slugs | `^[a-z0-9]+(-[a-z0-9]+)*$` — may start with a digit (`2026-small-business-trend-report`) |
| Timestamps | `timestamptz`, defaulting to `now()`; `updated_at` maintained by trigger |
| Editorial dates | `date`, named `reviewed_at` or `published_at`. These are shown to readers and are **not** row modification times |
| Publication | Every public table has `is_published boolean not null default true`; anonymous reads are filtered on it |

### Naming translation

The database is the source of truth for names. A TypeScript client is expected
to translate at the data-access boundary, once, and never leak `snake_case`
into components:

```
category_slug        → categorySlug
startup_cost_min     → startupCost.min
monthly_profit_max   → monthlyProfit.max
overall_score        → score
reviewed_at          → reviewedAt
```

---

## Enums

### `flexibility`

Where the work can physically be done.

| Value | Meaning |
| --- | --- |
| `anywhere` | No geographic tie at all |
| `remote` | Remote-friendly, but tied to client timezones or markets |
| `local` | Requires physical presence in one area |

Display capitalisation (`Anywhere`, `Remote`, `Local`) is a **presentation
concern**. Do not store capitalised values and do not compare against them.

### `research_kind`

`report` · `guide` · `data_study`

Note `data_study`, not `Data Study`. The display label is derived in the client.

### `listing_status`

`available` · `under_offer` · `sold` · `withdrawn`

---

## The scoring model

This is the most important part of the contract, because the product's whole
claim is that the numbers are honest.

### Factors

Six factors, each `smallint` in `[0, 100]`. **Higher is always better for the
operator.** This inverts the intuitive reading of two of them, deliberately:

| Column | `scoring_factors.key` | Weight | A high score means |
| --- | --- | --- | --- |
| `factor_demand` | `demand` | 0.250 | Buyers are actively searching and spending today |
| `factor_profit_potential` | `profit_potential` | 0.220 | Realistic monthly take-home is high |
| `factor_startup_cost` | `startup_cost` | 0.180 | **Cheap** to start — not expensive |
| `factor_time_to_revenue` | `time_to_revenue` | 0.150 | Short gap between starting and being paid |
| `factor_scalability` | `scalability` | 0.120 | Revenue can grow without hours growing with it |
| `factor_competition` | `competition` | 0.080 | The field is **not** crowded — a newcomer can win work |

### `overall_score`

A `GENERATED ALWAYS AS ... STORED` column. **No client can write it.** This is
the enforcement mechanism behind the promise that a published score always
matches the factors behind it:

```
round( demand*0.25 + profit_potential*0.22 + startup_cost*0.18
     + time_to_revenue*0.15 + scalability*0.12 + competition*0.08 )
```

Weights sum to exactly `1.000`, so the result is always `0..100`.

### The two-place rule

The weights live in **two** places by design:

1. The generated expression on `opportunities.overall_score` — computes the score.
2. The `scoring_factors` table — the published methodology the site renders.

A `CONSTRAINT TRIGGER` enforces that `scoring_factors.weight` sums to `1.000`.
It cannot check agreement with the generated expression, because a generated
column may not reference another table. **Changing a weight therefore requires
one migration that edits both**, plus a backfill (`ALTER TABLE ... ALTER COLUMN
overall_score` must be dropped and re-added to recompute stored values).

A client must **never** recompute the score locally and display the result. Read
`overall_score`. If a client needs the formula for a what-if tool, read the
weights from `scoring_factors` so there is still one published source.

---

## Tables

### `categories`

Closed set of five, keyed by slug. Adding one is a migration, not a data change.

| slug | label |
| --- | --- |
| `online` | Online |
| `service` | Service |
| `ecommerce` | E-Commerce |
| `local` | Local Business |
| `creative` | Creative |

> **Note the slugs.** They are `ecommerce` and `local` — not `e-commerce` and
> `local-business`. Slugs appear in URLs, so a client that invents its own
> spelling produces dead links.

### `opportunities`

The index itself. One row per business model.

Key columns beyond the factors above:

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | `text` unique | URL identity |
| `icon` | `text` | Name of a client-side icon, `^[a-z][a-zA-Z]*$`. The database does not know what icons exist; an unknown name must degrade gracefully |
| `startup_cost_min/max` | `integer` | Whole dollars |
| `monthly_profit_min/max` | `integer` | Whole dollars, realistic once established — not first-month |
| `hours_per_week_min/max` | `smallint` | `0..168` |
| `skills`, `pros`, `cons`, `tools` | `text[]` | Unordered scalar lists; no nulls permitted inside |
| `summary` | `text` | Minimum 40 characters |
| `reviewed_at` | `date` | Editorial review date shown on the page |

Indexed on category, score (descending), startup cost, flexibility, published,
and a GIN full-text index over `name || tagline || summary`.

### `opportunity_steps`

Ordered "how to start" steps — a child table rather than an array because each
step carries two fields and order is meaningful.

`(opportunity_id, position)` is unique and deferrable, so a reorder can happen
inside one transaction. `position` starts at 1. Deleting an opportunity cascades.

Seeding replaces an opportunity's steps wholesale rather than upserting row by
row, because positions shift when a step is inserted in the middle.

### `business_listings`

Acquisition listings. `cash_flow` is constrained `> 0` specifically because the
UI divides `asking_price` by it to show a multiple — the constraint makes a
division-by-zero unrepresentable rather than defensively handled.

Inclusion is not verification. Copy must not imply these figures are audited.

### `franchises`

`royalty` is deliberately `text`, not numeric: real systems quote
`6% of gross`, `5.5% + 2% marketing`, or a flat monthly fee. A numeric column
would misrepresent them.

### `funding_programs`

`min_credit_score` is **nullable**, and null is meaningful: the product is not
underwritten on a credit score at all (revenue-based financing). That is
materially different from a low threshold. Render it as "Not score-based", never
as `0` or `—` without explanation.

`typical_rate` is `text` for the same reason as `royalty`.

### `research_pieces`

`body` is nullable: takeaways publish ahead of the full write-up. A client must
handle a piece with takeaways and no body — that is a normal state, not an error.

### `newsletter_subscribers`

`email` is `citext`, so uniqueness is case-insensitive.

Anonymous visitors may `INSERT` and may **not** `SELECT`. There is deliberately
no read policy — the subscriber list is not retrievable through the public API.

---

## Row Level Security

RLS is enabled on every table. The posture:

| Actor | Reference data | Content | Newsletter |
| --- | --- | --- | --- |
| `anon` | read all | read `is_published` rows only | insert only |
| `authenticated` | read all | read `is_published` rows only | insert only |
| `service_role` | full (bypasses RLS) | full | full |

`opportunity_steps` has no `is_published` of its own; its policy joins to the
parent opportunity, so unpublishing an opportunity hides its steps in the same
statement.

All content writes go through `service_role`. There is no path by which an
anonymous caller mutates published content.

---

## Verification

The schema and seed are validated against a real PostgreSQL 16 instance. The
checks that must keep passing:

- `schema.sql` applies cleanly to an empty database
- `seed.sql` loads 5 categories, 6 scoring factors, 26 opportunities, 130 steps,
  6 listings, 6 franchises, 6 funding programs, 6 research pieces
- Re-running `seed.sql` changes no row counts (idempotent upserts)
- `sum(scoring_factors.weight) = 1.000`
- Every `overall_score` equals the weighted formula recomputed independently
- `anon` can read published rows, cannot write content, cannot read subscribers,
  can insert a subscription
- Unpublishing an opportunity hides both it and its steps from `anon`
- Range, factor-bound, foreign-key, and `cash_flow > 0` constraints all reject
  bad rows
- Breaking the weight sum raises and rolls back

---

## Client integration rules

1. **All domain data flows through a repository/query layer.** Pages and
   components must not import datasets or issue queries directly.
2. **Never recompute `overall_score`.** Read it.
3. **Never hard-code the category list.** Read `categories`, ordered by
   `sort_order`.
4. **Never hard-code scoring weights for display.** Read `scoring_factors`.
5. **Translate case once**, at the data-access boundary.
6. **Do not display counts the data does not support.** Counts shown to readers
   must be derived from the data, not from a marketing figure.
7. **Respect nullability.** `min_credit_score` and `research_pieces.body` are
   nullable and both nulls carry meaning.
