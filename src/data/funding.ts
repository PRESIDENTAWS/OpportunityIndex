import type { FundingProgram } from "@/lib/types";

/** Sample funding routes. Terms are typical ranges, not offers — see /methodology. */
export const FUNDING: FundingProgram[] = [
  {
    slug: "sba-7a",
    name: "SBA 7(a) Loan",
    type: "Government-backed term loan",
    amount: { min: 50000, max: 5000000 },
    typicalRate: "Prime + 2.25% to 4.75%",
    speed: "30-90 days",
    minCreditScore: 680,
    timeInBusiness: "2+ years (or strong acquisition case)",
    bestFor: "Buying an existing business, or refinancing expensive debt",
    requirements: [
      "Three years of business and personal tax returns",
      "10% equity injection on most acquisitions",
      "Personal guarantee from every 20%+ owner",
      "Collateral pledged where available",
    ],
    summary:
      "The workhorse of small business acquisition finance. Rates and terms are the best available to most buyers, and the trade-off is paperwork and a timeline measured in months rather than days.",
  },
  {
    slug: "dscr-loan",
    name: "DSCR Property Loan",
    type: "Asset-based real estate loan",
    amount: { min: 75000, max: 3000000 },
    typicalRate: "6.5% - 9.5%",
    speed: "14-30 days",
    minCreditScore: 660,
    timeInBusiness: "None required",
    bestFor: "Rental and short-term rental property acquisition",
    requirements: [
      "Debt service coverage ratio of 1.0 or better",
      "20-25% down payment",
      "Property appraisal and rent schedule",
      "Reserves covering 6 months of payments",
    ],
    summary:
      "Underwritten on the property's income rather than yours, which is why investors without W-2 income use it. No tax returns required in most programmes.",
  },
  {
    slug: "business-line-of-credit",
    name: "Business Line of Credit",
    type: "Revolving credit",
    amount: { min: 10000, max: 500000 },
    typicalRate: "8% - 24%",
    speed: "1-7 days",
    minCreditScore: 640,
    timeInBusiness: "6+ months",
    bestFor: "Working capital, inventory cycles, and payroll gaps",
    requirements: [
      "Six months of business bank statements",
      "Minimum monthly revenue, typically $10k",
      "Personal guarantee",
    ],
    summary:
      "Draw what you need, pay interest only on the balance. The right instrument for smoothing cash cycles and the wrong one for funding long-term assets.",
  },
  {
    slug: "equipment-financing",
    name: "Equipment Financing",
    type: "Secured term loan",
    amount: { min: 5000, max: 1000000 },
    typicalRate: "7% - 20%",
    speed: "1-10 days",
    minCreditScore: 600,
    timeInBusiness: "3+ months",
    bestFor: "Trucks, trailers, mowers, and machinery",
    requirements: [
      "Equipment quote or invoice",
      "Basic business financials",
      "The equipment itself serves as collateral",
    ],
    summary:
      "The equipment secures the loan, so approval is easier and rates beat unsecured options. Well suited to the trades and route businesses in this index.",
  },
  {
    slug: "microloan",
    name: "SBA Microloan",
    type: "Nonprofit intermediary loan",
    amount: { min: 500, max: 50000 },
    typicalRate: "8% - 13%",
    speed: "30-60 days",
    minCreditScore: 600,
    timeInBusiness: "Startups eligible",
    bestFor: "First-time owners with limited credit history",
    requirements: [
      "Business plan and cash-flow projection",
      "Often paired with mandatory training",
      "Some collateral or a co-signer",
    ],
    summary:
      "Administered by community lenders who will consider applicants banks will not. Amounts are small, and the business training attached is genuinely useful for a first-time owner.",
  },
  {
    slug: "revenue-based-financing",
    name: "Revenue-Based Financing",
    type: "Repaid as a share of revenue",
    amount: { min: 25000, max: 2000000 },
    typicalRate: "Factor 1.15x - 1.45x",
    speed: "2-10 days",
    minCreditScore: null,
    timeInBusiness: "12+ months",
    bestFor: "E-commerce and SaaS with predictable monthly revenue",
    requirements: [
      "Connected payment processor or accounting data",
      "Consistent monthly revenue history",
      "No equity dilution or personal guarantee in most deals",
    ],
    summary:
      "Repayment flexes with revenue, so slow months cost less. Expensive relative to bank debt, but fast and non-dilutive — a reasonable trade for inventory or ad spend with a known return.",
  },
];
