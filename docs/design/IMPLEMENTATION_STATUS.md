# Implementation Status

This file prevents future-state Figma screens from being mistaken for shipped capability.

## NOW — present in the lean MVP branch

- Public opportunity discovery
- Keyword search
- Working filters
- Opportunity detail pages
- Published Opportunity Score
- Personalized matcher using current supported inputs
- Funding comparison pages
- Newsletter capture path
- GA4 hooks
- Legal pages
- Responsive public UI
- Five-factor active scoring model after `0002_scoring_model.sql`
- Repository tests and local build verification

Important limitations:

- Opportunity dataset remains 26 canonical records.
- `main` has not yet absorbed the lean MVP until PR #4 is merged.
- Supabase is not yet the live application repository implementation.
- Affiliate conversions remain intentionally disabled/unverified.
- No user accounts, saved state, Pro billing, sponsor marketplace, admin CMS, or AI agent system is live.

## NEXT — implementation priority after merge

1. Automated CI becomes a required merge gate.
2. Connect `src/lib/repository.ts` to Supabase without changing its consumer interface.
3. Expand the dataset with consistent editorial sourcing and QA.
4. Align the public product more closely with Core Product Figma File 01.
5. Build the comparison engine.
6. Add accounts and saved opportunities.
7. Add Pro workspace/entitlements only after account persistence is stable.

## LATER — designed or conceptual, not shipped

- Sponsor inventory system
- Pro pricing and paywalls
- Funding qualification workflow
- Admin CMS and publishing workflow
- Businesses-for-sale transaction workspace
- Buyer/seller marketplace accounts
- Deal room and diligence workflow
- AI research/discovery/scoring agents
- Public research dashboards and historical index products

## Figma readiness

| Figma file | Design state | Code state |
| --- | --- | --- |
| 01 Core Product | Populated | Partial implementation |
| 02 Growth & Monetization | Populated | Partial foundations only |
| 03 Admin & Operations | Populated | Not implemented |
| 04 Marketplace & Transactions | Populated | Data foundations only |
| 05 AI Intelligence & Agents | Populated | Not implemented |
| 06 User / Pro Workspace | Populated | Not implemented |
| 07 Public Research Dashboard | File created; canvas not populated due Figma write limit | Not implemented |

## Definition of “implemented”

A capability is not considered implemented merely because:

- a Figma screen exists,
- a database table exists,
- a component renders placeholder content,
- an environment variable exists,
- or an adapter interface exists.

A feature is implemented when its underlying data path is real, required states are handled, tests/verification exist at an appropriate level, and production copy does not imply capability beyond what the system can actually do.
