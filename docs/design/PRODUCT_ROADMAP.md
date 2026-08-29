# Product Roadmap

This roadmap sequences Opportunity Index by dependency and business value. It intentionally does not attempt to implement every Figma concept at once.

## v0.1 — Launchable Opportunity Index

Goal: ship a trustworthy public decision engine with automated quality gates.

Required:

- Merge the lean MVP into `main`
- GitHub Actions CI: install, typecheck, lint, test, build, PostgreSQL contract
- Supabase-backed implementation behind `src/lib/repository.ts`
- Canonical opportunity dataset expanded beyond the original 26 only when editorial quality is defensible
- Opportunity Matcher
- Opportunity detail pages
- Search and filters
- Comparison engine
- Responsive/mobile QA
- Analytics and newsletter configured and verified
- Production deployment
- No unsupported claims or mocked integrations

## v0.2 — Retention + Pro Workspace

Goal: give users a reason to return and create subscription value.

Planned:

- Authentication
- Saved opportunities
- Persistent comparison sets
- Watchlists
- User goals/preferences
- Personalized dashboard
- Alerts
- Research library
- Pro entitlement layer
- Billing and account controls

Do not gate core public research needed to understand an opportunity merely to manufacture a paywall.

## v0.3 — Monetization System

Goal: monetize traffic without degrading editorial trust.

Planned:

- Verified affiliate conversion adapters
- Sponsor inventory and disclosure system
- Featured partner placements
- Newsletter sponsorship
- Funding lead/referral workflow
- Revenue attribution dashboard
- Pro conversion flows

Commercial relationships must remain separate from Opportunity Score.

## v0.4 — Marketplace

Goal: extend from “what should I start?” into “what could I buy?”

Planned:

- Businesses-for-sale discovery
- Franchise discovery
- Buyer profile and acquisition matching
- Seller/listing intake
- Diligence workspace
- Deal room
- Funding handoff

Marketplace listings require provenance and should not imply Opportunity Index verified seller claims unless a verification process actually exists.

## v0.5 — Internal Operating System

Goal: scale research and publishing without losing consistency.

Planned:

- Admin CMS
- Research intake pipeline
- Score QA
- Editorial approvals
- Publishing states
- Sponsor operations
- Audit trail
- Role-based permissions

## v0.6 — AI Intelligence Layer

Goal: use agents to accelerate research and maintenance while retaining human accountability.

Planned:

- Opportunity discovery agent
- Research enrichment agent
- Listing enrichment
- Score anomaly auditor
- Staleness alerts
- Content drafting
- Human-review queue
- Agent run history and governance

Agents may propose data; they do not silently publish or overwrite high-impact fields.

## v0.7 — Public Data Products

Goal: turn the underlying index into a differentiated research product.

Planned:

- Category indexes
- Historical score snapshots
- Trend signals
- Benchmarks
- Opportunity heatmaps
- Research reports
- Public methodology/provenance views

The corresponding Figma file currently exists as a placeholder and is not yet implementation-ready.

## Branch discipline

Examples:

```text
feat/supabase-integration
feat/expand-opportunity-dataset
feat/comparison-engine
feat/accounts-saved
feat/pro-workspace
feat/monetization-v2
feat/marketplace
feat/admin-cms
feat/ai-intelligence
feat/public-index-dashboard
```

One branch should have one clear product responsibility and one reviewable PR.
