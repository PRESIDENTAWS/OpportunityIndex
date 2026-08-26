import type { ResearchPieceRow } from "@/lib/contract";

/**
 * Research rows, matching `research_pieces` in the schema. `body` is null
 * while takeaways publish ahead of the full write-up — a normal state.
 */
export const RESEARCH_PIECE_ROWS: ResearchPieceRow[] = [
  {
    slug: "2026-small-business-trend-report",
    title: "The 2026 Small Business Trend Report",
    kind: "report",
    excerpt: "Where the money moved this year: service businesses held their margins, content-led models got harder, and the trades kept outrunning supply.",
    body: null,
    takeaways: [
      "Local service businesses posted the most stable margins of any category tracked",
      "Content-first models saw the longest time-to-first-dollar in the index",
      "Skilled trades continue to show demand well ahead of available operators",
      "Acquisition multiples for service businesses held steady year over year",
    ],
    reading_time_minutes: 14,
    published_at: "2026-08-18",
  },
  {
    slug: "startup-cost-vs-survival",
    title: "Does a Cheaper Start Mean a Longer Life?",
    kind: "data_study",
    excerpt: "Low startup cost is the most-cited reason people choose a business. We looked at whether it actually predicts anything about surviving year two.",
    body: null,
    takeaways: [
      "Startup cost correlates weakly with survival; recurring revenue correlates strongly",
      "Businesses with contracted monthly revenue outlast project-based peers",
      "Capital-light models fail more often from lack of distribution than lack of money",
    ],
    reading_time_minutes: 9,
    published_at: "2026-07-15",
  },
  {
    slug: "buy-vs-build-2026",
    title: "Buy vs. Build: What the Numbers Say",
    kind: "guide",
    excerpt: "Starting from zero is cheap and slow. Buying is expensive and fast. Here is how to work out which trade-off is actually yours.",
    body: null,
    takeaways: [
      "Acquisition buys cash flow on day one; startups buy optionality",
      "SBA 7(a) makes acquisition viable at 10% down for qualified buyers",
      "The deciding variable is usually time available, not capital available",
    ],
    reading_time_minutes: 11,
    published_at: "2026-06-30",
  },
  {
    slug: "service-business-pricing",
    title: "How Service Businesses Should Actually Price",
    kind: "guide",
    excerpt: "Hourly billing punishes you for getting better at your job. A practical guide to moving to packages, retainers, and outcome pricing.",
    body: null,
    takeaways: [
      "Hourly rates cap income and penalise efficiency gains",
      "Retainers cut acquisition cost and stabilise forecasting",
      "Most operators are one price increase away from a materially better year",
    ],
    reading_time_minutes: 8,
    published_at: "2026-06-12",
  },
  {
    slug: "franchise-fee-reality-check",
    title: "What Franchise Fees Actually Buy You",
    kind: "data_study",
    excerpt: "Royalties are the headline number, but they are rarely the biggest cost. A look at what franchisees pay for and what they get.",
    body: null,
    takeaways: [
      "Total investment routinely runs 2-4x the advertised franchise fee",
      "Marketing levies and required suppliers are the most underestimated costs",
      "Systems with strong national account pipelines justify their royalties most clearly",
    ],
    reading_time_minutes: 10,
    published_at: "2026-05-28",
  },
  {
    slug: "time-to-first-dollar",
    title: "Time to First Dollar, Ranked",
    kind: "data_study",
    excerpt: "The single most useful number when choosing what to start: how long until someone pays you.",
    body: null,
    takeaways: [
      "Local services reach a first paying customer fastest, typically inside two weeks",
      "Audience-led models average nine to eighteen months",
      "Speed to revenue is the factor most strongly associated with people not quitting",
    ],
    reading_time_minutes: 7,
    published_at: "2026-05-09",
  },
];
