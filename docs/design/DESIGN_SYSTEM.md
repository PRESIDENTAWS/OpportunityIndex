# Design System Contract

This document translates the current Opportunity Index visual direction into implementation constraints.

## Brand

**Positioning:** a decision engine for finding what to build, buy, start, or invest in next.

**Primary product flow:**

`DISCOVER → MATCH → RESEARCH → COMPARE → SAVE → EXECUTE`

The interface should feel closer to a financial/research product than a generic side-hustle blog.

## Core colors

- Space Black: `#0D1117`
- Deep Slate: `#1A1F2B`
- Horizon Blue: `#2563EB`
- Light Gray: `#F5F7FA`
- Pure White: `#FFFFFF`

Use blue for actions, selected state, score emphasis, and data focus. Avoid decorative overuse.

## Typography

Preferred display/body family: **Space Grotesk** where available, with a system-safe fallback.

Typography hierarchy should prioritize dense research readability:

- Display: product/category hero only
- H1: page identity
- H2/H3: research sections and table modules
- Body: concise explanatory copy
- Meta: methodology, update dates, labels, disclosures

## Product UI rules

- Ranked comparison is the core visual language.
- Scores and key economics must be scannable before long-form explanation.
- Match Score and Opportunity Score are visually distinct and semantically separate.
- Filters should expose meaningful operator constraints: capital, income target, time to revenue, weekly time, model, experience, and location when the dataset supports those fields honestly.
- Earth/horizon imagery is reserved for brand moments, not routine cards or data pages.
- Use restrained sponsor density. Commercial modules must be visually disclosed and must not resemble editorial ranking.
- Do not surface an unsupported vanity count or marketing superlative.

## Primary calls to action

Primary: **Find My Opportunity**

Secondary: **Explore All Opportunities**

Do not change these casually; they encode the intended product funnel.

## Responsive behavior

Desktop reference width: 1440px.

Mobile reference width: 390px.

The product must remain usable at 375px without horizontal scrolling. On mobile, prioritize:

1. score / match
2. economics
3. save / compare
4. summary
5. risks
6. roadmap / execution

Future account UI may use the bottom navigation pattern: Home · Explore · Match · Saved · Profile.

## Data honesty

Every number visible in production must be one of:

- calculated from canonical data,
- an editorial range with clear interpretation,
- a verified third-party value with provenance,
- or an explicitly labeled illustrative scenario.

Do not use mock Figma numbers as production data.

## Component direction

Expected reusable primitives include:

- `Button/Primary`
- `Button/Secondary`
- `Button/Blue`
- `Input/Search`
- `Score/Overall`
- `Score/Match`
- `Card/Metric`
- `Row/Opportunity`
- `Card/Opportunity`
- `Sponsor/Featured`
- `Navigation/Desktop`
- `Navigation/Mobile`

Implementation may rename components to match existing code conventions, but behavior and semantics should remain centralized rather than copied page-by-page.

## Accessibility

- Maintain WCAG-readable contrast.
- Never communicate score direction through color alone.
- All interactive controls require keyboard focus and visible focus state.
- Tables must degrade into readable mobile structures rather than overflowing horizontally.
- Motion is optional and must not be required to understand state.
