export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
}

/**
 * The launch navigation.
 *
 * Three destinations, because the MVP does three things: help you find an
 * opportunity, show you how it is scored, and say who is behind it. Anything
 * that would need a dropdown is not in this release.
 */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Explore", href: "/hustles" },
  { label: "Methodology", href: "/methodology" },
  { label: "About", href: "/about" },
];

export const FOOTER_NAV: { heading: string; links: NavChild[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "All Opportunities", href: "/hustles" },
      { label: "Funding", href: "/funding" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Methodology", href: "/methodology" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
