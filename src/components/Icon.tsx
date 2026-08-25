import type { SVGProps } from "react";

/**
 * A single thin-line icon family, matching the iconography sheet in the brand
 * guide: 1.5px strokes, round caps, 24px grid.
 */
const PATHS: Record<string, React.ReactNode> = {
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />,
  building: (
    <>
      <path d="M3 21h18M5 21V6l7-3 7 3v15" />
      <path d="M9 9h2m3 0h2M9 13h2m3 0h2M9 17h2m3 0h2" />
    </>
  ),
  tag: (
    <>
      <path d="M20.5 12.5 12 21 3 12V3h9l8.5 8.5Z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </>
  ),
  badge: (
    <>
      <path d="M12 2.5 14.4 5l3.4-.3.5 3.4L21 10l-1.6 3 1.6 3-2.7 1.9-.5 3.4-3.4-.3L12 23.5 9.6 21l-3.4.3-.5-3.4L3 16l1.6-3L3 10l2.7-1.9L6.2 4.7 9.6 5 12 2.5Z" />
      <path d="m9 12.5 2 2 4-4.5" />
    </>
  ),
  bank: (
    <>
      <path d="M3 9.5 12 4l9 5.5M4.5 9.5V18M9 9.5V18M15 9.5V18M19.5 9.5V18M2.5 21h19" />
    </>
  ),
  chart: (
    <>
      <path d="M3 21V4M3 21h18" />
      <path d="M7.5 21v-6M12 21V9M16.5 21v-9M21 21V6" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20.5h4L20 8.5a2.1 2.1 0 0 0-3-3L5 17.5v3Z" />
      <path d="m15.5 6.5 3 3" />
    </>
  ),
  cart: (
    <>
      <path d="M2.5 3.5h2.6l2.3 11.2h10L20 7H6" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8h3.5L8 5.5h8L17.5 8H21v11.5H3V8Z" />
      <circle cx="12" cy="13.5" r="3.6" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 12v8.5h13V12" />
      <path d="M10 20.5v-5h4v5" />
    </>
  ),
  code: <path d="m8.5 8-5 4 5 4M15.5 8l5 4-5 4M13.5 4.5l-3 15" />,
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21.5M8.5 21.5h7" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M2.5 9.5v5M5.5 7v10M18.5 7v10M21.5 9.5v5M5.5 12h13" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 3 4 5.5 2.5 10l3 1.2V21h13v-9.8l3-1.2L20 5.5 15 3" />
      <path d="M9 3a3 3 0 0 0 6 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 15a6.5 6.5 0 0 1 4 5.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </>
  ),
  play: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3.5" />
      <path d="m10 9 5 3-5 3V9Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-9 6-15 16-15 0 10-5 15-11 15a5 5 0 0 1-5-5Z" />
      <path d="M4.5 20.5c3-6 7-9 12-11" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z" />
      <path d="M18.5 16.5 19.4 19l2.6.9-2.6.9-.9 2.6" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <path d="m11.5 11.5 9 9M18 19l2-2M15 16l2-2" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 2 2.8V21a2.5 2.5 0 0 0-2-1.8H4v-14Z" />
      <path d="M20 4.5h-6a3 3 0 0 0-2 2.8V21a2.5 2.5 0 0 1 2-1.8h6v-14Z" />
    </>
  ),
  droplet: <path d="M12 2.5s6.5 7 6.5 11.2a6.5 6.5 0 1 1-13 0C5.5 9.5 12 2.5 12 2.5Z" />,
  box: (
    <>
      <path d="M12 2.8 21 7v10l-9 4.2L3 17V7l9-4.2Z" />
      <path d="M3 7l9 4.2L21 7M12 11.2V21.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  wrench: (
    <path d="M20 5.5a5.5 5.5 0 0 1-7.3 7.3L5.5 20a2.1 2.1 0 0 1-3-3l7.2-7.2A5.5 5.5 0 0 1 17 2.5l-3.2 3.2 2.5 2.5L19.5 5" />
  ),
  paw: (
    <>
      <ellipse cx="6.5" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="17.5" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="5.8" rx="2" ry="2.6" />
      <ellipse cx="14" cy="5.8" rx="2" ry="2.6" />
      <path d="M12 13c3.3 0 5.5 2.2 5.5 4.4S15.3 21 12 21s-5.5-1.4-5.5-3.6S8.7 13 12 13Z" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9.5h17M3.5 15h17M12 3.5v17" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="m8 7.5 12 11M20 5.5l-12 11" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h11V17h-11V6.5ZM13.5 10h4l3.5 3.5V17h-7.5" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17" cy="18.5" r="1.8" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />,
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  filter: <path d="M3.5 6.5h17M6.5 12h11M10 17.5h4" />,
  bookmark: <path d="M6 3.5h12v18l-6-4.5-6 4.5v-18Z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.5c3.5 2.5 5 6 5 9.5l-2.5 3h-5L7 12c0-3.5 1.5-7 5-9.5Z" />
      <circle cx="12" cy="9.5" r="1.8" />
      <path d="M9.5 15 7 20l3-1 2 2.5 2-2.5 3 1-2.5-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5V12l3.5 2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10.5" r="2.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.5 20 5.5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6l8-3Z" />
      <path d="m8.8 12 2.3 2.3 4.1-4.6" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3.5v17M6 20.5h12M12 6.5 4.5 8.5M12 6.5 19.5 8.5" />
      <path d="M4.5 8.5 2 14.5h5l-2.5-6ZM19.5 8.5 17 14.5h5l-2.5-6Z" />
    </>
  ),
  calculator: (
    <>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
      <path d="M8 6.5h8v3H8zM8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  const path = PATHS[name] ?? PATHS.grid;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );
}
