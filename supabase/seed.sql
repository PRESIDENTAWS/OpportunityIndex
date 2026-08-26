-- =============================================================================
-- Opportunity Index — seed data
-- =============================================================================
-- Run AFTER supabase/schema.sql, and run it FROM THE REPOSITORY ROOT, because
-- it reads data/opportunities.seed.json from a path relative to the working
-- directory:
--
--   psql "$DATABASE_URL" -f supabase/schema.sql
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- Opportunities are loaded straight out of data/opportunities.seed.json rather
-- than being duplicated as INSERT statements here, so the JSON contract and the
-- database can never drift apart. The smaller datasets below have no JSON
-- counterpart and are authored inline.
--
-- Idempotent: every insert upserts on its natural key, so re-running refreshes
-- content instead of failing or duplicating.
-- =============================================================================

\set ON_ERROR_STOP on
\set opportunities_json `cat data/opportunities.seed.json`

begin;

-- -----------------------------------------------------------------------------
-- Reference: categories
-- -----------------------------------------------------------------------------
insert into categories (slug, label, description, sort_order) values
  ('online',    'Online',         'Digital products, audiences, and affiliate models. Cheap to start, slow to distribute, and the most scalable end of the index.', 1),
  ('service',   'Service',        'You sell expertise and time. The fastest route to a first paying customer, and the one most bounded by hours in a week.',        2),
  ('ecommerce', 'E-Commerce',     'Physical products through your own store or a marketplace. The best margins in the index, funded by the most working capital.',  3),
  ('local',     'Local Business', 'Route, trade, and premises work in one geography. Unfashionable, recurring, and consistently the fastest to real monthly revenue.', 4),
  ('creative',  'Creative',       'Craft, media, and content. High ceilings and long runways — these reward patience more than capital.',                          5)
on conflict (slug) do update set
  label       = excluded.label,
  description = excluded.description,
  sort_order  = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Reference: scoring_factors
-- -----------------------------------------------------------------------------
-- These weights MUST match the generated overall_score expression in
-- supabase/schema.sql. The deferred sum-to-1.000 trigger checks this half.
insert into scoring_factors (key, label, description, weight, sort_order) values
  ('demand',           'Market Demand',    'Buyers are actively searching and spending in this market today.',        0.250, 1),
  ('profit_potential', 'Profit Potential', 'Realistic monthly take-home once the operation is established.',          0.220, 2),
  ('startup_cost',     'Low Startup Cost', 'Little capital is needed to get to a first paying customer.',             0.180, 3),
  ('time_to_revenue',  'Speed to Revenue', 'The gap between starting and being paid is short.',                       0.150, 4),
  ('scalability',      'Scalability',      'Revenue can grow without hours growing at the same rate.',                0.120, 5),
  ('competition',      'Competitive Room', 'The field is not yet saturated; a newcomer can still win work.',          0.080, 6)
on conflict (key) do update set
  label       = excluded.label,
  description = excluded.description,
  weight      = excluded.weight,
  sort_order  = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- opportunities — loaded from data/opportunities.seed.json
-- -----------------------------------------------------------------------------
insert into opportunities (
  slug, name, tagline, icon, category_slug,
  startup_cost_min, startup_cost_max, startup_cost_open_ended,
  monthly_profit_min, monthly_profit_max, monthly_profit_open_ended,
  hours_per_week_min, hours_per_week_max,
  flexibility, summary,
  factor_demand, factor_profit_potential, factor_startup_cost,
  factor_time_to_revenue, factor_scalability, factor_competition,
  skills, pros, cons, tools, reviewed_at
)
select
  x.slug, x.name, x.tagline, x.icon, x.category_slug,
  x.startup_cost_min, x.startup_cost_max, x.startup_cost_open_ended,
  x.monthly_profit_min, x.monthly_profit_max, x.monthly_profit_open_ended,
  x.hours_per_week_min, x.hours_per_week_max,
  x.flexibility, x.summary,
  x.factor_demand, x.factor_profit_potential, x.factor_startup_cost,
  x.factor_time_to_revenue, x.factor_scalability, x.factor_competition,
  x.skills, x.pros, x.cons, x.tools, x.reviewed_at
from jsonb_to_recordset(:'opportunities_json'::jsonb -> 'opportunities') as x (
  slug text, name text, tagline text, icon text, category_slug text,
  startup_cost_min integer, startup_cost_max integer, startup_cost_open_ended boolean,
  monthly_profit_min integer, monthly_profit_max integer, monthly_profit_open_ended boolean,
  hours_per_week_min smallint, hours_per_week_max smallint,
  flexibility flexibility, summary text,
  factor_demand smallint, factor_profit_potential smallint, factor_startup_cost smallint,
  factor_time_to_revenue smallint, factor_scalability smallint, factor_competition smallint,
  skills text[], pros text[], cons text[], tools text[], reviewed_at date
)
on conflict (slug) do update set
  name                      = excluded.name,
  tagline                   = excluded.tagline,
  icon                      = excluded.icon,
  category_slug             = excluded.category_slug,
  startup_cost_min          = excluded.startup_cost_min,
  startup_cost_max          = excluded.startup_cost_max,
  startup_cost_open_ended   = excluded.startup_cost_open_ended,
  monthly_profit_min        = excluded.monthly_profit_min,
  monthly_profit_max        = excluded.monthly_profit_max,
  monthly_profit_open_ended = excluded.monthly_profit_open_ended,
  hours_per_week_min        = excluded.hours_per_week_min,
  hours_per_week_max        = excluded.hours_per_week_max,
  flexibility               = excluded.flexibility,
  summary                   = excluded.summary,
  factor_demand             = excluded.factor_demand,
  factor_profit_potential   = excluded.factor_profit_potential,
  factor_startup_cost       = excluded.factor_startup_cost,
  factor_time_to_revenue    = excluded.factor_time_to_revenue,
  factor_scalability        = excluded.factor_scalability,
  factor_competition        = excluded.factor_competition,
  skills                    = excluded.skills,
  pros                      = excluded.pros,
  cons                      = excluded.cons,
  tools                     = excluded.tools,
  reviewed_at               = excluded.reviewed_at;

-- Steps are replaced wholesale per opportunity: positions shift when an
-- editor inserts a step, so upserting row by row would leave orphans.
delete from opportunity_steps
where opportunity_id in (
  select o.id
  from opportunities o
  join jsonb_to_recordset(:'opportunities_json'::jsonb -> 'opportunities')
       as x (slug text) on x.slug = o.slug
);

insert into opportunity_steps (opportunity_id, position, title, detail)
select o.id, s.position, s.title, s.detail
from jsonb_to_recordset(:'opportunities_json'::jsonb -> 'opportunities')
     as x (slug text, steps jsonb)
join opportunities o on o.slug = x.slug
cross join lateral jsonb_to_recordset(x.steps)
     as s (position smallint, title text, detail text);

-- -----------------------------------------------------------------------------
-- business_listings
-- -----------------------------------------------------------------------------
insert into business_listings (
  slug, name, industry, location, asking_price, annual_revenue, cash_flow,
  established_year, employee_count, owner_financing, reason_for_sale, highlights, reviewed_at
) values
  ('midwest-commercial-cleaning', 'Commercial Cleaning Contractor', 'Services', 'Columbus, OH',
   485000, 940000, 186000, 2011, 14, true, 'Owner retiring after 15 years',
   array[
     '22 recurring commercial contracts, average tenure 4.6 years',
     'Supervisors run daily operations; owner works ~10 hours a week',
     'Seller will carry 30% over four years'
   ], date '2026-08-12'),

  ('outdoor-gear-dtc', 'Outdoor Gear DTC Brand', 'E-Commerce', 'Remote / US',
   1250000, 2100000, 412000, 2018, 4, false, 'Founder starting a new venture',
   array[
     '38% repeat purchase rate on a 96,000-address email list',
     'Three manufacturing partners, none over 45% of volume',
     '3PL fulfilment already in place — no warehouse to assume'
   ], date '2026-08-09'),

  ('hvac-service-company', 'HVAC Service & Install Company', 'Home Services', 'Phoenix, AZ',
   890000, 1650000, 298000, 2006, 9, true, 'Health; owner stepping back',
   array[
     '610 active maintenance-plan members billing monthly',
     'Six branded service vehicles included in the sale',
     'Licensed lead technician committed to staying on'
   ], date '2026-08-14'),

  ('b2b-saas-scheduling', 'B2B Scheduling SaaS', 'Software', 'Remote',
   720000, 310000, 214000, 2019, 2, false, 'Founder returning to employment',
   array[
     '$26k MRR with 2.1% monthly logo churn',
     '68% of signups arrive from organic search',
     'Contract developer available to continue post-sale'
   ], date '2026-08-06'),

  ('neighborhood-coffee-roaster', 'Neighborhood Coffee Roaster & Cafe', 'Food & Beverage', 'Asheville, NC',
   340000, 720000, 118000, 2014, 11, true, 'Relocating out of state',
   array[
     'Wholesale accounts with 9 local restaurants',
     'Roasting equipment valued at $95k included',
     'Lease runs to 2031 with a five-year renewal option'
   ], date '2026-07-30'),

  ('regional-lawn-care-route', 'Regional Lawn Care Route', 'Home Services', 'Raleigh, NC',
   215000, 385000, 104000, 2015, 5, true, 'Owner consolidating into commercial work',
   array[
     '310 contracted residential accounts on a dense route',
     'All equipment owned outright and included',
     'Snow contracts carry revenue through winter'
   ], date '2026-08-11')
on conflict (slug) do update set
  name             = excluded.name,
  industry         = excluded.industry,
  location         = excluded.location,
  asking_price     = excluded.asking_price,
  annual_revenue   = excluded.annual_revenue,
  cash_flow        = excluded.cash_flow,
  established_year = excluded.established_year,
  employee_count   = excluded.employee_count,
  owner_financing  = excluded.owner_financing,
  reason_for_sale  = excluded.reason_for_sale,
  highlights       = excluded.highlights,
  reviewed_at      = excluded.reviewed_at;

-- -----------------------------------------------------------------------------
-- franchises
-- -----------------------------------------------------------------------------
insert into franchises (
  slug, name, industry, franchise_fee, total_investment_min, total_investment_max,
  royalty, liquid_capital_required, unit_count, founded_year, summary, support, reviewed_at
) values
  ('brightpath-cleaning', 'BrightPath Cleaning Co.', 'Commercial Cleaning',
   39500, 62000, 118000, '6% of gross', 50000, 214, 2009,
   'A commercial janitorial franchise built around recurring nightly contracts. Territories are sold by commercial square footage rather than population, and the franchisor handles national account sales on the franchisee''s behalf.',
   array['Two-week initial training', 'National account pipeline', 'Regional field manager', 'Fleet and supply purchasing'],
   date '2026-08-01'),

  ('grillhouse-kitchens', 'GrillHouse Kitchens', 'Fast Casual',
   45000, 385000, 940000, '5.5% + 2% marketing', 250000, 386, 1998,
   'A fast-casual grill concept with a compact kitchen footprint and a menu built for delivery volume. Ghost-kitchen conversions have become the fastest-growing part of the system.',
   array['Site selection', 'Six-week operator training', 'Supply chain agreements', 'Local marketing co-op'],
   date '2026-07-28'),

  ('ledgerworks-bookkeeping', 'LedgerWorks Bookkeeping', 'Business Services',
   29000, 34000, 61000, '8% of gross', 30000, 97, 2016,
   'A home-based bookkeeping franchise aimed at owner-operators. No premises, no staff required at launch, and a client-acquisition programme that targets local trades and restaurants.',
   array['Certification programme', 'Client acquisition system', 'Software licences included', 'Peer mastermind groups'],
   date '2026-08-04'),

  ('sprout-early-learning', 'Sprout Early Learning', 'Education',
   60000, 480000, 1400000, '7% of gross', 350000, 141, 2004,
   'Licensed early-childhood centres in suburban markets with persistent waiting lists. Capital-intensive and heavily regulated, but enrolment revenue is unusually predictable once a centre fills.',
   array['Licensing guidance', 'Curriculum and staff training', 'Enrolment marketing', 'Construction management'],
   date '2026-07-25'),

  ('peakform-fitness', 'PeakForm Fitness Studios', 'Health & Fitness',
   49500, 290000, 610000, '7% of gross', 150000, 268, 2012,
   'Small-group strength studios on a membership model, typically 2,000-3,000 square feet. Revenue is subscription-based, and mature studios run on a manager rather than the owner.',
   array['Coach certification', 'Pre-sale launch campaign', 'Equipment package', 'Membership CRM'],
   date '2026-08-08'),

  ('haulaway-junk', 'HaulAway Junk Removal', 'Home Services',
   42000, 98000, 235000, '8% of gross', 75000, 173, 2007,
   'A branded junk-removal system with a national call centre that books jobs directly into the franchisee''s schedule. Trucks are the main capital line, and territories are drawn by household count.',
   array['Call centre booking', 'Truck financing programme', 'Disposal partnerships', 'Launch marketing'],
   date '2026-08-10')
on conflict (slug) do update set
  name                    = excluded.name,
  industry                = excluded.industry,
  franchise_fee           = excluded.franchise_fee,
  total_investment_min    = excluded.total_investment_min,
  total_investment_max    = excluded.total_investment_max,
  royalty                 = excluded.royalty,
  liquid_capital_required = excluded.liquid_capital_required,
  unit_count              = excluded.unit_count,
  founded_year            = excluded.founded_year,
  summary                 = excluded.summary,
  support                 = excluded.support,
  reviewed_at             = excluded.reviewed_at;

-- -----------------------------------------------------------------------------
-- funding_programs
-- -----------------------------------------------------------------------------
insert into funding_programs (
  slug, name, funding_type, amount_min, amount_max, typical_rate, speed,
  min_credit_score, time_in_business, best_for, summary, requirements, reviewed_at
) values
  ('sba-7a', 'SBA 7(a) Loan', 'Government-backed term loan',
   50000, 5000000, 'Prime + 2.25% to 4.75%', '30-90 days', 680,
   '2+ years (or strong acquisition case)', 'Buying an existing business, or refinancing expensive debt',
   'The workhorse of small business acquisition finance. Rates and terms are the best available to most buyers, and the trade-off is paperwork and a timeline measured in months rather than days.',
   array[
     'Three years of business and personal tax returns',
     '10% equity injection on most acquisitions',
     'Personal guarantee from every 20%+ owner',
     'Collateral pledged where available'
   ], date '2026-08-15'),

  ('dscr-loan', 'DSCR Property Loan', 'Asset-based real estate loan',
   75000, 3000000, '6.5% - 9.5%', '14-30 days', 660,
   'None required', 'Rental and short-term rental property acquisition',
   'Underwritten on the property''s income rather than yours, which is why investors without W-2 income use it. No tax returns required in most programmes.',
   array[
     'Debt service coverage ratio of 1.0 or better',
     '20-25% down payment',
     'Property appraisal and rent schedule',
     'Reserves covering 6 months of payments'
   ], date '2026-08-15'),

  ('business-line-of-credit', 'Business Line of Credit', 'Revolving credit',
   10000, 500000, '8% - 24%', '1-7 days', 640,
   '6+ months', 'Working capital, inventory cycles, and payroll gaps',
   'Draw what you need, pay interest only on the balance. The right instrument for smoothing cash cycles and the wrong one for funding long-term assets.',
   array[
     'Six months of business bank statements',
     'Minimum monthly revenue, typically $10k',
     'Personal guarantee'
   ], date '2026-08-15'),

  ('equipment-financing', 'Equipment Financing', 'Secured term loan',
   5000, 1000000, '7% - 20%', '1-10 days', 600,
   '3+ months', 'Trucks, trailers, mowers, and machinery',
   'The equipment secures the loan, so approval is easier and rates beat unsecured options. Well suited to the trades and route businesses in this index.',
   array[
     'Equipment quote or invoice',
     'Basic business financials',
     'The equipment itself serves as collateral'
   ], date '2026-08-15'),

  ('microloan', 'SBA Microloan', 'Nonprofit intermediary loan',
   500, 50000, '8% - 13%', '30-60 days', 600,
   'Startups eligible', 'First-time owners with limited credit history',
   'Administered by community lenders who will consider applicants banks will not. Amounts are small, and the business training attached is genuinely useful for a first-time owner.',
   array[
     'Business plan and cash-flow projection',
     'Often paired with mandatory training',
     'Some collateral or a co-signer'
   ], date '2026-08-15'),

  ('revenue-based-financing', 'Revenue-Based Financing', 'Repaid as a share of revenue',
   25000, 2000000, 'Factor 1.15x - 1.45x', '2-10 days', null,
   '12+ months', 'E-commerce and SaaS with predictable monthly revenue',
   'Repayment flexes with revenue, so slow months cost less. Expensive relative to bank debt, but fast and non-dilutive — a reasonable trade for inventory or ad spend with a known return.',
   array[
     'Connected payment processor or accounting data',
     'Consistent monthly revenue history',
     'No equity dilution or personal guarantee in most deals'
   ], date '2026-08-15')
on conflict (slug) do update set
  name             = excluded.name,
  funding_type     = excluded.funding_type,
  amount_min       = excluded.amount_min,
  amount_max       = excluded.amount_max,
  typical_rate     = excluded.typical_rate,
  speed            = excluded.speed,
  min_credit_score = excluded.min_credit_score,
  time_in_business = excluded.time_in_business,
  best_for         = excluded.best_for,
  summary          = excluded.summary,
  requirements     = excluded.requirements,
  reviewed_at      = excluded.reviewed_at;

-- -----------------------------------------------------------------------------
-- research_pieces
-- -----------------------------------------------------------------------------
-- body is intentionally NULL: takeaways publish ahead of the full write-up.
insert into research_pieces (
  slug, title, kind, excerpt, takeaways, reading_time_minutes, published_at
) values
  ('2026-small-business-trend-report', 'The 2026 Small Business Trend Report', 'report',
   'Where the money moved this year: service businesses held their margins, content-led models got harder, and the trades kept outrunning supply.',
   array[
     'Local service businesses posted the most stable margins of any category tracked',
     'Content-first models saw the longest time-to-first-dollar in the index',
     'Skilled trades continue to show demand well ahead of available operators',
     'Acquisition multiples for service businesses held steady year over year'
   ], 14, date '2026-08-18'),

  ('startup-cost-vs-survival', 'Does a Cheaper Start Mean a Longer Life?', 'data_study',
   'Low startup cost is the most-cited reason people choose a business. We looked at whether it actually predicts anything about surviving year two.',
   array[
     'Startup cost correlates weakly with survival; recurring revenue correlates strongly',
     'Businesses with contracted monthly revenue outlast project-based peers',
     'Capital-light models fail more often from lack of distribution than lack of money'
   ], 9, date '2026-07-15'),

  ('buy-vs-build-2026', 'Buy vs. Build: What the Numbers Say', 'guide',
   'Starting from zero is cheap and slow. Buying is expensive and fast. Here is how to work out which trade-off is actually yours.',
   array[
     'Acquisition buys cash flow on day one; startups buy optionality',
     'SBA 7(a) makes acquisition viable at 10% down for qualified buyers',
     'The deciding variable is usually time available, not capital available'
   ], 11, date '2026-06-30'),

  ('service-business-pricing', 'How Service Businesses Should Actually Price', 'guide',
   'Hourly billing punishes you for getting better at your job. A practical guide to moving to packages, retainers, and outcome pricing.',
   array[
     'Hourly rates cap income and penalise efficiency gains',
     'Retainers cut acquisition cost and stabilise forecasting',
     'Most operators are one price increase away from a materially better year'
   ], 8, date '2026-06-12'),

  ('franchise-fee-reality-check', 'What Franchise Fees Actually Buy You', 'data_study',
   'Royalties are the headline number, but they are rarely the biggest cost. A look at what franchisees pay for and what they get.',
   array[
     'Total investment routinely runs 2-4x the advertised franchise fee',
     'Marketing levies and required suppliers are the most underestimated costs',
     'Systems with strong national account pipelines justify their royalties most clearly'
   ], 10, date '2026-05-28'),

  ('time-to-first-dollar', 'Time to First Dollar, Ranked', 'data_study',
   'The single most useful number when choosing what to start: how long until someone pays you.',
   array[
     'Local services reach a first paying customer fastest, typically inside two weeks',
     'Audience-led models average nine to eighteen months',
     'Speed to revenue is the factor most strongly associated with people not quitting'
   ], 7, date '2026-05-09')
on conflict (slug) do update set
  title                = excluded.title,
  kind                 = excluded.kind,
  excerpt              = excluded.excerpt,
  takeaways            = excluded.takeaways,
  reading_time_minutes = excluded.reading_time_minutes,
  published_at         = excluded.published_at;

commit;
