-- =============================================================================
-- Migration 0002 — Lean MVP scoring model
-- =============================================================================
-- Replaces the six-factor launch model with the five factors the MVP can
-- support honestly, and reweights them.
--
-- ## Why the model changed
--
-- The MVP scores an opportunity on how well it fits a reader's capital, time,
-- and income goal. Two of the six intended dimensions have no data behind them:
--
--   * operational simplicity — no column, and no honest proxy
--   * experience fit / difficulty — no column; every record carries exactly
--     three skills, so skill count carries no signal
--
-- Rather than invent ratings for 26 records, both are omitted and the remaining
-- five weights are renormalised to sum to 1.000. Both are documented on
-- /methodology as planned dimensions awaiting consistent editorial ratings.
--
-- ## What is preserved
--
--   * `factor_scalability` and `factor_competition` KEEP their data. They are
--     no longer scored, but nothing is dropped — a later model can score them
--     again without a backfill.
--   * The two-place rule from docs/DATA_MODEL.md still holds: the generated
--     column and the `scoring_factors` table are updated together, in one
--     transaction, and the sum-to-1.000 constraint trigger still guards the
--     table.
--
-- ## Flexibility
--
-- Unlike the other four factors there is no `factor_flexibility` column. It is
-- derived from the existing `flexibility` enum, which is contract data:
--
--     anywhere -> 100   no geographic tie at all
--     remote   ->  70   remote-friendly, tied to client timezones or markets
--     local    ->  30   requires physical presence in one area
--
-- Deriving it in the generated column keeps the score unforgeable by a client,
-- exactly as before. The mapping is published on /methodology.
--
-- Apply after 0001:
--   psql "$DATABASE_URL" -f supabase/migrations/0002_scoring_model.sql
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Regenerate overall_score
-- -----------------------------------------------------------------------------
-- A stored generated column cannot be altered in place; it is dropped and
-- re-added, which recomputes every stored value.
alter table opportunities drop column overall_score;

alter table opportunities
  add column overall_score smallint generated always as (
    round(
        factor_profit_potential * 0.278
      + factor_startup_cost     * 0.222
      + factor_time_to_revenue  * 0.222
      + factor_demand           * 0.167
      + (case flexibility
           when 'anywhere' then 100
           when 'remote'   then  70
           when 'local'    then  30
         end)                   * 0.111
    )::smallint
  ) stored;

comment on column opportunities.overall_score is
  'Generated, never written by a client. Weighted blend of four factor_* columns plus a flexibility score derived from the flexibility enum. Weights mirror the scoring_factors table.';

-- The score index was dropped with the column.
create index opportunities_score_idx on opportunities (overall_score desc);

-- -----------------------------------------------------------------------------
-- Replace the published model
-- -----------------------------------------------------------------------------
-- The sum-to-1.000 trigger is deferred, so the delete and insert can both run
-- inside this transaction; it is checked once at commit.
delete from scoring_factors;

insert into scoring_factors (key, label, description, weight, sort_order) values
  ('profit_potential', 'Income Potential',
   'Realistic monthly take-home once the operation is established.',                       0.278, 1),
  ('startup_cost',     'Startup Affordability',
   'Little capital is needed to reach a first paying customer.',                           0.222, 2),
  ('time_to_revenue',  'Speed to First Revenue',
   'The gap between starting and being paid is short.',                                    0.222, 3),
  ('demand',           'Demand Durability',
   'Buyers are actively searching and spending, and are likely to keep doing so.',         0.167, 4),
  ('flexibility',      'Flexibility',
   'The work can be done without being tied to one location. Derived from the flexibility of each opportunity: anywhere 100, remote 70, local 30.',
                                                                                           0.111, 5);

-- 0.278 + 0.222 + 0.222 + 0.167 + 0.111 = 1.000

commit;
