# Product Spec

**Opportunity Index** — Find. Evaluate. Build. Grow.

---

## The problem

Advice about starting a business is either a sales pitch or a story. Someone
deciding what to do next can find a hundred articles telling them a cleaning
business is a good idea, and none that tell them how it compares to a
bookkeeping practice on the things that actually decide whether they stick with
it: what it costs, how long until someone pays them, and whether growing means
working more hours.

The information exists. It is not comparable.

## The product

An index that asks every opportunity the same questions and publishes the
answers on one scale, with the formula shown.

Four things follow from that, and they are the whole product:

1. **One scale.** Side hustles, businesses, franchises, and acquisitions scored
   the same way, so they can be ranked against each other.
2. **Published weights.** The reader can disagree with the model. That is the
   point of showing it.
3. **A date on every figure.** Every entry says when it was last reviewed.
4. **Independence that is structural, not promised.** No scoring input
   references advertising. See [Editorial independence](#editorial-independence).

## Who it is for

| Audience | Arrives asking | Leaves with |
| --- | --- | --- |
| The undecided starter | "What should I start?" | A shortlist filtered by what they can actually spend and the hours they actually have |
| The comparer | "Is A better than B for *me*?" | A factor-by-factor comparison, not a verdict |
| The buyer | "Should I build or buy?" | Acquisition listings with the multiple shown, and the financing that fits |
| The operator | "How do I price / fund / grow this?" | Research and calculators |

## Non-goals

Naming these keeps scope honest:

- **Not a marketplace.** We do not broker deals or take a transaction cut.
- **Not a course platform.** No paid education product.
- **Not lead generation dressed as editorial.** Sponsors buy placement, never
  position.
- **Not personalised financial advice.** The disclaimer is real, not decorative.
- **Not a social network.** No profiles, feeds, or user-generated rankings.

---

## Surfaces

### The index

The ranked table is the core screen. It must support filtering by category,
startup cost band, and flexibility, plus free-text search and sorting by score,
cost, profit, hours, or name.

**Filter state lives in the URL.** A filtered view has to be shareable, survive
a refresh, and render server-side. This is a hard requirement, not an
optimisation — it is how the index gets linked to.

### The opportunity page

The full record: the six-factor breakdown with weights visible, realistic
figures, what works, what to watch, how to start, and the review date.

The score breakdown is not decoration. A reader who disagrees with a ranking
should be able to see exactly which factor drove it.

### Acquisitions, franchises, funding

Each is a comparison surface first and a detail page second. The columns that
matter are the ones people actually decide on: asking price against cash flow
and the resulting multiple; total investment against the advertised franchise
fee; rate, speed, and eligibility for funding.

### Research

Reports, guides, and data studies drawn from the index. Takeaways may publish
ahead of the full write-up — the data model supports this explicitly.

### Tools

Calculators that do the arithmetic that actually decides things: what a launch
costs including contingency and personal runway, when the business breaks even,
and how two opportunities compare factor by factor.

They run client-side. Figures a user types are never transmitted.

---

## Editorial independence

The site carries advertising and sponsored placements. All are labelled.

The commitment is enforceable, not aspirational:

- No scoring factor references advertising, sponsorship, or commercial
  relationships. The formula is published and can be checked against the data.
- `overall_score` is computed in the database as a generated column. There is no
  code path by which an editor or advertiser sets a score directly.
- Sponsored placements are visually distinct and labelled where they appear.

If a sponsor is also covered editorially, the coverage is scored exactly as it
would be otherwise.

## Honesty rules

These are product requirements, not style preferences. The product's only asset
is that its numbers can be trusted.

1. **Counts shown to readers are derived from the data.** If the index holds 26
   models, the interface says 26. A mockup figure is never shipped as a fact.
2. **Estimates are labelled as estimates.** Cost and profit figures describe a
   realistic range for a typical solo operator in a mid-sized US market. They are
   not guarantees, not averages of a survey, and not projections for the reader.
3. **Third-party figures are labelled as unverified.** Listings, franchise terms,
   and lending rates come from third parties and change without notice.
4. **Scores are never revised to preserve a ranking.** When a factor changes, the
   score changes with it.
5. **Corrections take priority.** If a number here is wrong, fixing it outranks
   shipping anything else.

## Accessibility and performance

- Semantic HTML; the ranked table is a real `<table>` with header scopes.
- Full keyboard operation, visible focus, and a skip link.
- Light and dark themes, set before first paint, with no flash.
- The index renders and filters without client-side JavaScript.
- Wide tables scroll inside their own container; the page body never scrolls
  horizontally.

## Success measures

| Measure | Why it matters |
| --- | --- |
| Filtered-URL shares | The index is being used as a reference, not just browsed |
| Comparisons run | People are deciding, not just reading |
| Newsletter conversion | An owned audience, independent of platforms |
| Corrections filed and fixed | Readers trust the data enough to challenge it |
| Sponsor renewal | The commercial model works without touching editorial |
