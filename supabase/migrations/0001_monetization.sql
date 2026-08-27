-- =============================================================================
-- Migration 0001 — Monetization MVP Phase 1
-- =============================================================================
-- ADDITIVE ONLY. This migration creates new tables and touches nothing that
-- supabase/schema.sql already defines. In particular it does NOT alter the
-- canonical opportunity tables and does NOT create a second newsletter
-- subscriber table — `newsletter_subscribers` from schema.sql remains the one
-- local source of record for email capture.
--
-- Apply after schema.sql:
--   psql "$DATABASE_URL" -f supabase/schema.sql
--   psql "$DATABASE_URL" -f supabase/seed.sql
--   psql "$DATABASE_URL" -f supabase/migrations/0001_monetization.sql
--
-- Privacy posture: no table here stores a raw visitor IP address. Coarse
-- signals only (a truncated country code, a hashed pseudonymous visitor id).
--
-- Security posture: RLS is enabled on every table and NO public read policy is
-- granted anywhere. Analytics, revenue, and sponsor records are invisible to
-- `anon` and `authenticated`. All writes run through `service_role`, which
-- bypasses RLS, from the server-only Supabase client.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

-- Lifecycle of a commission as reported by the affiliate network.
--   pending  - recorded by the network, not yet validated
--   approved - validated by the merchant, payable
--   reversed - cancelled, refunded, or rejected after the fact
--   paid     - actually received
create type conversion_status as enum ('pending', 'approved', 'reversed', 'paid');

create type affiliate_network as enum ('impact', 'refersion', 'direct', 'other');

create type sponsorship_status as enum ('draft', 'scheduled', 'live', 'completed', 'cancelled');

-- -----------------------------------------------------------------------------
-- affiliate_programs
-- -----------------------------------------------------------------------------
-- One row per merchant relationship.
--
-- `is_active` defaults to FALSE on purpose: a program stays dark until a real,
-- approved tracking URL has been entered by a human. Nothing in the application
-- may invent an affiliate identifier.
create table affiliate_programs (
  id                  uuid              primary key default gen_random_uuid(),
  slug                text              not null unique
                        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text              not null,
  merchant            text              not null,
  network             affiliate_network not null default 'other',

  -- Commission terms, recorded for reconciliation against network reports.
  commission_rate     numeric(6,4)      check (commission_rate >= 0 and commission_rate <= 1),
  commission_flat     integer           check (commission_flat >= 0),
  currency            char(3)           not null default 'USD',
  cookie_window_days  smallint          check (cookie_window_days > 0),

  -- Disclosure text shown near links for this program, when it must differ
  -- from the site-wide disclosure.
  disclosure_note     text,

  is_active           boolean           not null default false,
  notes               text,
  created_at          timestamptz       not null default now(),
  updated_at          timestamptz       not null default now()
);

comment on table affiliate_programs is
  'Merchant affiliate relationships. is_active defaults to false: a program must not go live until a real approved tracking URL exists.';
comment on column affiliate_programs.commission_rate is
  'Fractional rate, e.g. 0.0800 for 8%. Null when the program pays a flat amount.';

create trigger affiliate_programs_set_updated_at
  before update on affiliate_programs
  for each row execute function set_updated_at();

create index affiliate_programs_active_idx on affiliate_programs (is_active) where is_active;

-- -----------------------------------------------------------------------------
-- affiliate_links
-- -----------------------------------------------------------------------------
-- The redirect targets. `destination_url` holds the REAL tracking URL supplied
-- by the network, including its affiliate/referral identifier. The application
-- appends UTM parameters for its own analytics but never fabricates, alters, or
-- strips the affiliate identifier already present.
create table affiliate_links (
  id              uuid        primary key default gen_random_uuid(),
  program_id      uuid        not null references affiliate_programs (id) on delete cascade,

  -- The public slug in /api/go/<slug>.
  slug            text        not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label           text        not null,

  -- Must be absolute HTTPS. Enforced here as well as in application code so a
  -- hand-inserted row cannot introduce an open redirect or a plaintext hop.
  destination_url text        not null
                    check (destination_url ~ '^https://[^\s]+$'),

  -- Optional context used to build UTM parameters and to attribute revenue
  -- back to a page. Text rather than a foreign key so a link can outlive the
  -- opportunity it was first placed on.
  opportunity_slug text,
  category_slug    text,
  placement        text,

  is_active       boolean     not null default true,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table affiliate_links is
  'Redirect targets for /api/go/<slug>. destination_url is the real network tracking URL; the app never invents affiliate identifiers.';
comment on column affiliate_links.destination_url is
  'Absolute HTTPS only. The affiliate/referral identifier lives here and is preserved verbatim through the redirect.';

create trigger affiliate_links_set_updated_at
  before update on affiliate_links
  for each row execute function set_updated_at();

create index affiliate_links_program_idx     on affiliate_links (program_id);
create index affiliate_links_active_idx      on affiliate_links (is_active) where is_active;
create index affiliate_links_opportunity_idx on affiliate_links (opportunity_slug);

-- -----------------------------------------------------------------------------
-- affiliate_clicks
-- -----------------------------------------------------------------------------
-- One row per outbound click. This is attribution data, not conversion data:
-- a click is an intent signal and nothing more.
--
-- No raw IP address is stored. `visitor_hash` is a salted pseudonymous digest
-- computed server-side; `country_code` is the coarsest useful geography.
create table affiliate_clicks (
  id             uuid        primary key default gen_random_uuid(),
  link_id        uuid        not null references affiliate_links (id) on delete cascade,
  program_id     uuid        not null references affiliate_programs (id) on delete cascade,

  -- Mirrors the cookie handed to the visitor, and the value a network may echo
  -- back on a conversion.
  click_id       uuid        not null unique,

  -- Pseudonymous, salted, non-reversible. Never a raw IP.
  visitor_hash   text,
  country_code   char(2),
  -- Coarse client hints only.
  device_type    text,
  referrer_host  text,

  opportunity_slug text,
  category_slug    text,
  placement        text,
  destination_host text        not null,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table affiliate_clicks is
  'Outbound click attribution. Contains no raw IP addresses: visitor_hash is a salted pseudonymous digest and country_code is coarse geography.';
comment on column affiliate_clicks.click_id is
  'UUID handed to the visitor in a first-party cookie and echoed back by networks that support click-level attribution.';

create trigger affiliate_clicks_set_updated_at
  before update on affiliate_clicks
  for each row execute function set_updated_at();

create index affiliate_clicks_link_idx     on affiliate_clicks (link_id, created_at desc);
create index affiliate_clicks_program_idx  on affiliate_clicks (program_id, created_at desc);
create index affiliate_clicks_created_idx  on affiliate_clicks (created_at desc);

-- -----------------------------------------------------------------------------
-- affiliate_conversions
-- -----------------------------------------------------------------------------
-- Commissions as reported by an affiliate network. A row here exists only
-- because a network told us about it through a verified webhook or an imported
-- report — never because the application observed a click.
--
-- Gross order value and our actual commission are stored separately: they are
-- different numbers and conflating them overstates revenue.
create table affiliate_conversions (
  id                    uuid              primary key default gen_random_uuid(),
  program_id            uuid              not null references affiliate_programs (id) on delete restrict,

  -- Null when the network reports a conversion we cannot tie to a click.
  -- That is normal and must not be treated as an error.
  click_id              uuid              references affiliate_clicks (click_id) on delete set null,

  network               affiliate_network not null,
  -- The network's own identifier for this conversion. Unique per network so a
  -- replayed webhook or a re-imported report cannot double-count revenue.
  network_conversion_id text              not null,

  merchant              text              not null,
  order_reference       text,

  -- Money in minor units (cents) to avoid floating point entirely.
  gross_value_minor     bigint            not null check (gross_value_minor >= 0),
  commission_minor      bigint            not null check (commission_minor >= 0),
  currency              char(3)           not null default 'USD',

  status                conversion_status not null default 'pending',
  occurred_at           timestamptz       not null,
  status_updated_at     timestamptz       not null default now(),

  -- The verified payload as received, for audit and re-processing.
  raw_payload           jsonb,

  created_at            timestamptz       not null default now(),
  updated_at            timestamptz       not null default now(),

  -- Idempotency: the same conversion from the same network lands exactly once.
  constraint affiliate_conversions_network_id_unique
    unique (network, network_conversion_id)
);

comment on table affiliate_conversions is
  'Commissions reported by affiliate networks via verified webhook or report import. Never inferred from clicks.';
comment on column affiliate_conversions.gross_value_minor is
  'Customer order value in minor units. Distinct from commission_minor — conflating them overstates revenue.';
comment on column affiliate_conversions.commission_minor is
  'What we actually earn, in minor units. This is the revenue figure.';
comment on constraint affiliate_conversions_network_id_unique on affiliate_conversions is
  'Idempotency guard: replayed webhooks and re-imported reports cannot double-count.';

create trigger affiliate_conversions_set_updated_at
  before update on affiliate_conversions
  for each row execute function set_updated_at();

create index affiliate_conversions_program_idx  on affiliate_conversions (program_id, occurred_at desc);
create index affiliate_conversions_click_idx    on affiliate_conversions (click_id);
create index affiliate_conversions_status_idx   on affiliate_conversions (status, occurred_at desc);

-- -----------------------------------------------------------------------------
-- sponsorships
-- -----------------------------------------------------------------------------
-- The commercial relationship with a sponsor.
create table sponsorships (
  id             uuid        primary key default gen_random_uuid(),
  slug           text        not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sponsor_name   text        not null,
  contact_email  citext,
  -- Contract value in minor units.
  contract_value_minor bigint check (contract_value_minor >= 0),
  currency       char(3)     not null default 'USD',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table sponsorships is
  'Sponsor relationships. Commercially sensitive: no public read policy exists for this table.';

create trigger sponsorships_set_updated_at
  before update on sponsorships
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- sponsorship_campaigns
-- -----------------------------------------------------------------------------
create table sponsorship_campaigns (
  id             uuid               primary key default gen_random_uuid(),
  sponsorship_id uuid               not null references sponsorships (id) on delete cascade,
  name           text               not null,
  status         sponsorship_status not null default 'draft',
  starts_at      timestamptz        not null,
  ends_at        timestamptz        not null,

  -- Creative shown to readers. Always rendered with a visible sponsored label.
  headline       text               not null,
  body           text,
  cta_label      text               not null,
  cta_url        text               not null check (cta_url ~ '^https://[^\s]+$'),

  created_at     timestamptz        not null default now(),
  updated_at     timestamptz        not null default now(),

  constraint sponsorship_campaigns_window check (starts_at < ends_at)
);

create trigger sponsorship_campaigns_set_updated_at
  before update on sponsorship_campaigns
  for each row execute function set_updated_at();

create index sponsorship_campaigns_live_idx
  on sponsorship_campaigns (status, starts_at, ends_at);

-- -----------------------------------------------------------------------------
-- sponsorship_placements
-- -----------------------------------------------------------------------------
-- Where a campaign runs, and its delivery counters.
create table sponsorship_placements (
  id           uuid        primary key default gen_random_uuid(),
  campaign_id  uuid        not null references sponsorship_campaigns (id) on delete cascade,

  -- e.g. 'sidebar-featured', 'index-inline', 'newsletter'.
  slot         text        not null,
  -- Optional targeting; null means site-wide.
  category_slug text,
  route_pattern text,

  -- Aggregate counters only. Per-visitor delivery is never stored here.
  impressions  bigint      not null default 0 check (impressions >= 0),
  clicks       bigint      not null default 0 check (clicks >= 0),

  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint sponsorship_placements_slot_unique unique (campaign_id, slot)
);

comment on table sponsorship_placements is
  'Where a sponsored campaign runs. Counters are aggregate; no per-visitor delivery record is kept.';

create trigger sponsorship_placements_set_updated_at
  before update on sponsorship_placements
  for each row execute function set_updated_at();

create index sponsorship_placements_campaign_idx on sponsorship_placements (campaign_id);

-- -----------------------------------------------------------------------------
-- newsletter_subscribers — additive columns
-- -----------------------------------------------------------------------------
-- Extends the EXISTING table from schema.sql. No second subscriber table is
-- created: this stays the one local source of record for email capture.
--
-- `confirmed_at` already exists and means "completed double opt-in".
-- `consent_at` is a different fact: when the visitor ticked the box. Recording
-- them separately keeps the consent audit trail honest.
alter table newsletter_subscribers
  add column if not exists consent_at             timestamptz,
  add column if not exists provider_subscriber_id text;

comment on column newsletter_subscribers.consent_at is
  'When the visitor gave consent at signup. Distinct from confirmed_at, which records completed double opt-in.';
comment on column newsletter_subscribers.provider_subscriber_id is
  'Downstream email provider subscriber id (Kit). Null when the provider is unconfigured or the forward failed.';

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- RLS on for every table, and deliberately NO policy granting select, insert,
-- update, or delete to anon or authenticated. With RLS enabled and no policy,
-- every such statement is denied. Only service_role — which bypasses RLS and is
-- reachable only from the server-only Supabase client — can touch these rows.
--
-- This is why the tables carry no public read: click logs, commission revenue,
-- and sponsor contract values are none of a visitor's business.

alter table affiliate_programs     enable row level security;
alter table affiliate_links        enable row level security;
alter table affiliate_clicks       enable row level security;
alter table affiliate_conversions  enable row level security;
alter table sponsorships           enable row level security;
alter table sponsorship_campaigns  enable row level security;
alter table sponsorship_placements enable row level security;

-- Force RLS so even a table owner is subject to it, closing the gap where a
-- privileged connection string would otherwise read freely.
alter table affiliate_programs     force row level security;
alter table affiliate_links        force row level security;
alter table affiliate_clicks       force row level security;
alter table affiliate_conversions  force row level security;
alter table sponsorships           force row level security;
alter table sponsorship_campaigns  force row level security;
alter table sponsorship_placements force row level security;

-- Belt and braces: revoke table privileges from the public roles outright, so
-- access does not depend on policy absence alone.
revoke all on affiliate_programs     from anon, authenticated;
revoke all on affiliate_links        from anon, authenticated;
revoke all on affiliate_clicks       from anon, authenticated;
revoke all on affiliate_conversions  from anon, authenticated;
revoke all on sponsorships           from anon, authenticated;
revoke all on sponsorship_campaigns  from anon, authenticated;
revoke all on sponsorship_placements from anon, authenticated;

commit;
