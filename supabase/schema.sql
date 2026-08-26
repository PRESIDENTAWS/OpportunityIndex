-- =============================================================================
-- Opportunity Index — canonical database schema
-- =============================================================================
-- This file is the contract. Application code conforms to it, not the reverse.
--
-- Conventions used throughout:
--   * snake_case for every identifier
--   * money is stored as INTEGER whole US dollars (never cents, never float);
--     these are researched estimate ranges, so sub-dollar precision is noise
--   * enum labels are lowercase snake_case
--   * every public-facing table carries `is_published` and is readable by
--     anonymous visitors only when true
--   * timestamps are timestamptz, defaulting to now()
--
-- Apply with:  psql "$DATABASE_URL" -f supabase/schema.sql
-- Then seed:   psql "$DATABASE_URL" -f supabase/seed.sql
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
-- citext gives case-insensitive email uniqueness without a functional index.
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------
-- Supabase provisions these already. Created here when absent so the schema
-- applies unchanged to a plain PostgreSQL instance for testing.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

-- Where the work can physically be done.
--   anywhere - no geographic tie at all
--   remote   - remote-friendly but tied to client timezones or markets
--   local    - requires physical presence in one area
create type flexibility as enum ('anywhere', 'remote', 'local');

create type research_kind as enum ('report', 'guide', 'data_study');

create type listing_status as enum ('available', 'under_offer', 'sold', 'withdrawn');

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Reference: categories
-- -----------------------------------------------------------------------------
create table categories (
  slug         text primary key
                 check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label        text        not null,
  description  text        not null,
  sort_order   smallint    not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint categories_sort_order_unique unique (sort_order) deferrable initially deferred
);

comment on table categories is
  'The five top-level buckets an opportunity can belong to. Closed set: adding one is a migration, not a data change.';

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- Reference: scoring_factors
-- -----------------------------------------------------------------------------
-- The published scoring model. This table is what the methodology page reads,
-- and its weights MUST match the generated expression on
-- opportunities.overall_score below. Changing a weight means editing both, in
-- one migration. `scoring_factors_weights_sum` guards the table's half of that.
create table scoring_factors (
  key          text primary key
                 check (key ~ '^[a-z][a-z0-9_]*$'),
  label        text        not null,
  description  text        not null,
  weight       numeric(4,3) not null
                 check (weight > 0 and weight <= 1),
  sort_order   smallint    not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table scoring_factors is
  'The six weighted inputs to overall_score. Higher is always better for the operator: a high startup_cost score means CHEAP to start, a high competition score means the field is NOT crowded.';

comment on column scoring_factors.weight is
  'Fraction of the overall score. All weights must sum to exactly 1.000 — enforced by the deferred constraint trigger below.';

create trigger scoring_factors_set_updated_at
  before update on scoring_factors
  for each row execute function set_updated_at();

-- Weights must always total 1.000. Deferred so a multi-row seed or rebalance
-- can run inside one transaction without tripping mid-way.
create or replace function assert_scoring_weights_sum_to_one()
returns trigger
language plpgsql
as $$
declare
  total numeric(6,3);
begin
  select coalesce(sum(weight), 0) into total from scoring_factors;
  -- An empty table is allowed: it is the state before seeding.
  if total <> 0 and total <> 1 then
    raise exception 'scoring_factors.weight must sum to 1.000, got %', total;
  end if;
  return null;
end;
$$;

create constraint trigger scoring_factors_weights_sum
  after insert or update or delete on scoring_factors
  deferrable initially deferred
  for each row execute function assert_scoring_weights_sum_to_one();

-- -----------------------------------------------------------------------------
-- opportunities
-- -----------------------------------------------------------------------------
create table opportunities (
  id                         uuid        primary key default gen_random_uuid(),
  slug                       text        not null unique
                               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                       text        not null check (length(name) between 1 and 120),
  tagline                    text        not null check (length(tagline) between 1 and 200),
  icon                       text        not null check (icon ~ '^[a-z][a-zA-Z]*$'),
  category_slug              text        not null references categories (slug)
                               on update cascade on delete restrict,

  -- Money: integer whole US dollars. `*_open_ended` renders the upper bound
  -- as "$X+" — it means "at least", not "unbounded".
  startup_cost_min           integer     not null check (startup_cost_min >= 0),
  startup_cost_max           integer     not null check (startup_cost_max >= 0),
  startup_cost_open_ended    boolean     not null default false,
  monthly_profit_min         integer     not null check (monthly_profit_min >= 0),
  monthly_profit_max         integer     not null check (monthly_profit_max >= 0),
  monthly_profit_open_ended  boolean     not null default false,

  hours_per_week_min         smallint    not null check (hours_per_week_min between 0 and 168),
  hours_per_week_max         smallint    not null check (hours_per_week_max between 0 and 168),

  flexibility                flexibility not null,
  summary                    text        not null check (length(summary) >= 40),

  -- The six scoring factors, each 0-100, higher always better for the operator.
  factor_demand              smallint    not null check (factor_demand between 0 and 100),
  factor_profit_potential    smallint    not null check (factor_profit_potential between 0 and 100),
  factor_startup_cost        smallint    not null check (factor_startup_cost between 0 and 100),
  factor_time_to_revenue     smallint    not null check (factor_time_to_revenue between 0 and 100),
  factor_scalability         smallint    not null check (factor_scalability between 0 and 100),
  factor_competition         smallint    not null check (factor_competition between 0 and 100),

  -- Derived in the database so no client can publish a score that disagrees
  -- with the factors behind it. Weights mirror the scoring_factors table.
  overall_score smallint generated always as (
    round(
        factor_demand           * 0.25
      + factor_profit_potential * 0.22
      + factor_startup_cost     * 0.18
      + factor_time_to_revenue  * 0.15
      + factor_scalability      * 0.12
      + factor_competition      * 0.08
    )::smallint
  ) stored,

  skills                     text[]      not null default '{}' check (array_position(skills, null) is null),
  pros                       text[]      not null default '{}' check (array_position(pros, null) is null),
  cons                       text[]      not null default '{}' check (array_position(cons, null) is null),
  tools                      text[]      not null default '{}' check (array_position(tools, null) is null),

  is_published               boolean     not null default true,
  -- The date the factors were last reviewed. Shown to readers, so it is a
  -- deliberate editorial date, not a row mtime.
  reviewed_at                date        not null,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),

  constraint opportunities_startup_cost_range   check (startup_cost_min <= startup_cost_max),
  constraint opportunities_monthly_profit_range check (monthly_profit_min <= monthly_profit_max),
  constraint opportunities_hours_range          check (hours_per_week_min <= hours_per_week_max)
);

comment on table opportunities is
  'Business models in the index. Figures are researched estimates for a typical solo operator in a mid-sized US market — not guarantees, not survey averages.';
comment on column opportunities.overall_score is
  'Generated, never written by a client. Weighted blend of the six factor_* columns, rounded to a whole number 0-100.';
comment on column opportunities.reviewed_at is
  'Editorial review date shown on the opportunity page. Not a row modification timestamp.';

create trigger opportunities_set_updated_at
  before update on opportunities
  for each row execute function set_updated_at();

create index opportunities_category_idx     on opportunities (category_slug);
create index opportunities_score_idx        on opportunities (overall_score desc);
create index opportunities_published_idx    on opportunities (is_published) where is_published;
create index opportunities_startup_cost_idx on opportunities (startup_cost_min);
create index opportunities_flexibility_idx  on opportunities (flexibility);

-- Free-text search across the fields a reader would search by.
create index opportunities_search_idx on opportunities
  using gin (to_tsvector('english', name || ' ' || tagline || ' ' || summary));

-- -----------------------------------------------------------------------------
-- opportunity_steps
-- -----------------------------------------------------------------------------
-- Ordered "how to start" steps. A table rather than an array because each step
-- carries two fields and the order is meaningful.
create table opportunity_steps (
  id              uuid        primary key default gen_random_uuid(),
  opportunity_id  uuid        not null references opportunities (id) on delete cascade,
  position        smallint    not null check (position > 0),
  title           text        not null check (length(title) between 1 and 160),
  detail          text        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint opportunity_steps_position_unique unique (opportunity_id, position) deferrable initially deferred
);

create trigger opportunity_steps_set_updated_at
  before update on opportunity_steps
  for each row execute function set_updated_at();

create index opportunity_steps_opportunity_idx on opportunity_steps (opportunity_id, position);

-- -----------------------------------------------------------------------------
-- business_listings
-- -----------------------------------------------------------------------------
create table business_listings (
  id                uuid           primary key default gen_random_uuid(),
  slug              text           not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text           not null,
  industry          text           not null,
  location          text           not null,

  asking_price      integer        not null check (asking_price > 0),
  annual_revenue    integer        not null check (annual_revenue >= 0),
  -- Seller's discretionary earnings. Must be > 0 so the asking-price multiple
  -- shown to buyers can never divide by zero.
  cash_flow         integer        not null check (cash_flow > 0),

  established_year  smallint       not null check (established_year between 1800 and 2100),
  employee_count    smallint       not null check (employee_count >= 0),
  owner_financing   boolean        not null default false,
  reason_for_sale   text           not null,
  highlights        text[]         not null default '{}',
  status            listing_status not null default 'available',

  is_published      boolean        not null default true,
  reviewed_at       date           not null,
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now()
);

comment on table business_listings is
  'Acquisition listings supplied by brokers and owners. Inclusion is not verification — buyers must do their own diligence.';
comment on column business_listings.cash_flow is
  'Seller discretionary earnings per year. Constrained > 0 because the UI divides asking_price by it to show a multiple.';

create trigger business_listings_set_updated_at
  before update on business_listings
  for each row execute function set_updated_at();

create index business_listings_published_idx on business_listings (is_published) where is_published;
create index business_listings_price_idx     on business_listings (asking_price);
create index business_listings_industry_idx  on business_listings (industry);

-- -----------------------------------------------------------------------------
-- franchises
-- -----------------------------------------------------------------------------
create table franchises (
  id                     uuid        primary key default gen_random_uuid(),
  slug                   text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                   text        not null,
  industry               text        not null,

  franchise_fee          integer     not null check (franchise_fee >= 0),
  total_investment_min   integer     not null check (total_investment_min >= 0),
  total_investment_max   integer     not null check (total_investment_max >= 0),
  -- Free text: real systems quote royalties as "6% of gross", "5.5% + 2% ad
  -- fund", or a flat monthly fee. A numeric column would misrepresent them.
  royalty                text        not null,
  liquid_capital_required integer    not null check (liquid_capital_required >= 0),

  unit_count             integer     not null check (unit_count >= 0),
  founded_year           smallint    not null check (founded_year between 1800 and 2100),
  summary                text        not null,
  support                text[]      not null default '{}',

  is_published           boolean     not null default true,
  reviewed_at            date        not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint franchises_investment_range check (total_investment_min <= total_investment_max)
);

create trigger franchises_set_updated_at
  before update on franchises
  for each row execute function set_updated_at();

create index franchises_published_idx  on franchises (is_published) where is_published;
create index franchises_investment_idx on franchises (total_investment_min);

-- -----------------------------------------------------------------------------
-- funding_programs
-- -----------------------------------------------------------------------------
create table funding_programs (
  id                 uuid        primary key default gen_random_uuid(),
  slug               text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name               text        not null,
  funding_type       text        not null,

  amount_min         integer     not null check (amount_min >= 0),
  amount_max         integer     not null check (amount_max >= 0),
  -- Free text for the same reason as franchises.royalty: real quotes are
  -- "Prime + 2.25%", "6.5% - 9.5%", or "factor 1.15x - 1.45x".
  typical_rate       text        not null,
  speed              text        not null,
  -- Null means the product is not underwritten on a credit score at all,
  -- which is materially different from a score of zero.
  min_credit_score   smallint    check (min_credit_score between 300 and 850),
  time_in_business   text        not null,
  best_for           text        not null,
  summary            text        not null,
  requirements       text[]      not null default '{}',

  is_published       boolean     not null default true,
  reviewed_at        date        not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint funding_programs_amount_range check (amount_min <= amount_max)
);

comment on column funding_programs.min_credit_score is
  'NULL means not score-based (e.g. revenue-based financing), which is not the same as a low threshold.';

create trigger funding_programs_set_updated_at
  before update on funding_programs
  for each row execute function set_updated_at();

create index funding_programs_published_idx on funding_programs (is_published) where is_published;

-- -----------------------------------------------------------------------------
-- research_pieces
-- -----------------------------------------------------------------------------
create table research_pieces (
  id                   uuid          primary key default gen_random_uuid(),
  slug                 text          not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title                text          not null,
  kind                 research_kind not null,
  excerpt              text          not null,
  -- Null until the full write-up ships; the takeaways publish first.
  body                 text,
  takeaways            text[]        not null default '{}',
  reading_time_minutes smallint      not null check (reading_time_minutes > 0),

  is_published         boolean       not null default true,
  published_at         date          not null,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now()
);

create trigger research_pieces_set_updated_at
  before update on research_pieces
  for each row execute function set_updated_at();

create index research_pieces_published_idx on research_pieces (is_published, published_at desc);
create index research_pieces_kind_idx      on research_pieces (kind);

-- -----------------------------------------------------------------------------
-- newsletter_subscribers
-- -----------------------------------------------------------------------------
create table newsletter_subscribers (
  id              uuid        primary key default gen_random_uuid(),
  email           citext      not null unique,
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  source          text        not null default 'web',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table newsletter_subscribers is
  'Anonymous visitors may INSERT (subscribe) but can never SELECT — the list is not readable through the public API.';

create trigger newsletter_subscribers_set_updated_at
  before update on newsletter_subscribers
  for each row execute function set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Default posture: RLS on everywhere, anonymous read of published rows only,
-- and no anonymous writes anywhere except a newsletter signup. All content
-- writes go through service_role, which bypasses RLS.

alter table categories             enable row level security;
alter table scoring_factors        enable row level security;
alter table opportunities          enable row level security;
alter table opportunity_steps      enable row level security;
alter table business_listings      enable row level security;
alter table franchises             enable row level security;
alter table funding_programs       enable row level security;
alter table research_pieces        enable row level security;
alter table newsletter_subscribers enable row level security;

-- Reference data is public in full: it is the published methodology.
create policy categories_public_read on categories
  for select to anon, authenticated using (true);

create policy scoring_factors_public_read on scoring_factors
  for select to anon, authenticated using (true);

-- Content tables expose published rows only.
create policy opportunities_public_read on opportunities
  for select to anon, authenticated using (is_published);

-- A step is visible exactly when its parent opportunity is.
create policy opportunity_steps_public_read on opportunity_steps
  for select to anon, authenticated
  using (exists (
    select 1 from opportunities o
    where o.id = opportunity_steps.opportunity_id and o.is_published
  ));

create policy business_listings_public_read on business_listings
  for select to anon, authenticated using (is_published);

create policy franchises_public_read on franchises
  for select to anon, authenticated using (is_published);

create policy funding_programs_public_read on funding_programs
  for select to anon, authenticated using (is_published);

create policy research_pieces_public_read on research_pieces
  for select to anon, authenticated using (is_published);

-- Signing up is the one write anonymous visitors may perform. There is
-- deliberately no matching select policy, so the list cannot be read back.
create policy newsletter_subscribers_public_insert on newsletter_subscribers
  for insert to anon, authenticated with check (true);

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on
  categories, scoring_factors, opportunities, opportunity_steps,
  business_listings, franchises, funding_programs, research_pieces
  to anon, authenticated;

grant insert on newsletter_subscribers to anon, authenticated;

commit;
