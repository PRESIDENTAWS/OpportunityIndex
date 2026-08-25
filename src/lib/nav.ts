export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Hustles", href: "/hustles" },
  {
    label: "Businesses",
    href: "/businesses",
    children: [
      { label: "All Categories", href: "/businesses", description: "Every model in the index" },
      { label: "Online", href: "/businesses/online", description: "Digital products, audiences, affiliate" },
      { label: "Service", href: "/businesses/service", description: "Sell your time and expertise" },
      { label: "E-Commerce", href: "/businesses/e-commerce", description: "Physical products and marketplaces" },
      { label: "Local Business", href: "/businesses/local-business", description: "Route, trade, and premises work" },
      { label: "Creative", href: "/businesses/creative", description: "Craft, media, and content" },
    ],
  },
  { label: "Businesses for Sale", href: "/businesses-for-sale" },
  { label: "Franchises", href: "/franchises" },
  { label: "Funding", href: "/funding" },
  {
    label: "Research",
    href: "/research",
    children: [
      { label: "All Research", href: "/research", description: "Reports, guides, and data studies" },
      { label: "Reports", href: "/research?kind=Report", description: "Annual and quarterly analysis" },
      { label: "Guides", href: "/research?kind=Guide", description: "Practical how-to walkthroughs" },
      { label: "Data Studies", href: "/research?kind=Data+Study", description: "What the index numbers show" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "All Tools", href: "/tools", description: "Calculators and comparisons" },
      { label: "Startup Cost Calculator", href: "/tools/startup-cost", description: "Model what a launch really costs" },
      { label: "Break-Even Calculator", href: "/tools/break-even", description: "Find the month you turn profitable" },
      { label: "Compare Opportunities", href: "/tools/compare", description: "Two models, side by side" },
    ],
  },
  { label: "About", href: "/about" },
];

export const FOOTER_NAV: { heading: string; links: NavChild[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Hustles", href: "/hustles" },
      { label: "Businesses", href: "/businesses" },
      { label: "Businesses for Sale", href: "/businesses-for-sale" },
      { label: "Franchises", href: "/franchises" },
      { label: "Funding", href: "/funding" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Research", href: "/research" },
      { label: "Tools", href: "/tools" },
      { label: "Guides", href: "/research?kind=Guide" },
      { label: "Calculators", href: "/tools/startup-cost" },
      { label: "Compare", href: "/tools/compare" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Methodology", href: "/methodology" },
      { label: "Advertise", href: "/advertise" },
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

export const MOBILE_TABS: { label: string; href: string; icon: string }[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Explore", href: "/hustles", icon: "compass" },
  { label: "Saved", href: "/saved", icon: "bookmark" },
  { label: "Profile", href: "/about", icon: "user" },
];

export const CATEGORY_TABS: { label: string; href: string; icon: string }[] = [
  { label: "Hustles", href: "/hustles", icon: "bolt" },
  { label: "Businesses", href: "/businesses", icon: "building" },
  { label: "For Sale", href: "/businesses-for-sale", icon: "tag" },
  { label: "Franchises", href: "/franchises", icon: "badge" },
  { label: "Funding", href: "/funding", icon: "bank" },
  { label: "Research", href: "/research", icon: "chart" },
];
