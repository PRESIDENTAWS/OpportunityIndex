# Figma Index

This document maps the Opportunity Index Figma architecture to code ownership and delivery priority. Figma describes the target product system; GitHub determines what is actually implemented and shippable.

## File 01 — Core Product

**Figma:** https://www.figma.com/design/d1jFGfPOWzzxqJgp6gfCpc

**Purpose:** Discovery, rankings, opportunity detail, matching, comparison, responsive product UI, and the core visual system.

**Code ownership:**

- `src/app/**`
- `src/components/**`
- `src/lib/repository.ts`
- matcher and scoring presentation
- opportunity detail and comparison UI

**Delivery:** NOW / NEXT

## File 02 — Growth & Monetization

**Figma:** https://www.figma.com/design/eRG6iYP9985MDR7um2UW3r

**Purpose:** Pro pricing concepts, sponsor inventory, funding conversion, newsletter, research-report conversion, funnels, media kit, and monetization dashboard concepts.

**Code ownership:**

- affiliate redirect and attribution modules
- newsletter integration
- analytics events
- future sponsor placements
- future Pro billing and gating

**Delivery:** NEXT / LATER

## File 03 — Admin & Operations

**Figma:** https://www.figma.com/design/WFdXnQy3TApdHKBoaqTstV

**Purpose:** Opportunity CMS, research workflow, scoring QA, publishing, sponsor operations, analytics operations, permissions, and audit history.

**Code ownership:**

- future `/admin/**`
- service-role content mutations
- editorial workflow
- scoring validation
- sponsor operations

**Delivery:** LATER

## File 04 — Marketplace & Transactions

**Figma:** https://www.figma.com/design/DhhMu4mAAe0PCvAHngPtQC

**Purpose:** Businesses for sale, franchise discovery, acquisition matching, buyer and seller flows, diligence workspace, deal room, and funding handoff.

**Code ownership:**

- future `/marketplace/**`
- business listings
- franchise records
- buyer/seller profiles
- diligence and transaction workflow

**Delivery:** LATER

## File 05 — AI Intelligence & Agents

**Figma:** https://www.figma.com/design/3Ovtbn8YtQapyJU4KJIVEl

**Purpose:** Research agents, discovery, scoring audit, listing enrichment, content generation, automation control, alerts, review queues, and AI governance.

**Code ownership:**

- future agent services
- internal AI orchestration
- human-review queue
- AI audit and governance surfaces

**Delivery:** LATER

## File 06 — User Account, Pro Workspace & Portfolio

**Figma:** https://www.figma.com/design/uOoJMSbdpNagRtgMlAdpTf

**Purpose:** Onboarding, personalized dashboard, saved opportunities, watchlists, comparisons, goals, alerts, research library, billing, and account settings.

**Code ownership:**

- future authentication
- saved opportunities
- persistent comparisons
- alerts
- billing and entitlements
- profile/privacy settings

**Delivery:** NEXT

## File 07 — Public Research, Data Visualization & Index Dashboard

**Figma:** https://www.figma.com/design/cFElAAqG59eAizLbnrzCtW

**Purpose:** Public category indexes, trends, benchmarks, historical score movement, heatmaps, methodology, provenance, and research data products.

**Current design status:** The Figma file exists but was not populated because the Figma Starter-plan write limit was reached. Treat it as an architectural placeholder, not an implementation-ready screen set.

**Code ownership:**

- future `/research/**`
- public index dashboards
- historical snapshots
- data visualization
- methodology/provenance extensions

**Delivery:** LATER

## Implementation rule

Before implementing any Figma frame, check `docs/design/IMPLEMENTATION_STATUS.md`.

A Figma frame may be visually complete while its underlying capability is intentionally unbuilt. Do not fabricate backend state, partner data, conversion metrics, user data, or paid entitlements just to make a future-state screen appear functional.
