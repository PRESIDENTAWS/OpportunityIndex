import Link from "next/link";

interface MarkProps {
  size?: number;
  className?: string;
  /** The light streak from the brand sheet. Off for very small sizes. */
  beam?: boolean;
  idPrefix?: string;
}

/** The OI monogram: an open O, a solid I, and a horizon streak across both. */
export function Mark({ size = 40, className = "", beam = true, idPrefix = "oi" }: MarkProps) {
  const gradientId = `${idPrefix}-beam`;
  return (
    <svg
      viewBox="0 0 132 64"
      height={size}
      width={(size * 132) / 64}
      fill="none"
      role="img"
      aria-label="Opportunity Index"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="132" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#dbeafe" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="34" cy="32" r="26" stroke="currentColor" strokeWidth="4.5" />
      <path d="M92 6v52" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" />
      {beam && (
        <path
          d="M2 30h128"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

interface LogoProps {
  /** `full` adds the stacked wordmark, `tagline` adds the strapline beneath it. */
  variant?: "mark" | "full" | "tagline";
  size?: number;
  className?: string;
  href?: string | null;
  idPrefix?: string;
}

export function Logo({
  variant = "full",
  size = 34,
  className = "",
  href = "/",
  idPrefix = "oi",
}: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark size={size} idPrefix={idPrefix} />
      {variant !== "mark" && (
        <span className="flex flex-col justify-center border-l border-current/25 pl-3">
          <span
            className="text-[0.72rem] leading-[1.15] font-medium tracking-brand uppercase sm:text-[0.8rem]"
            style={{ letterSpacing: "0.18em" }}
          >
            Opportunity
            <br />
            Index
          </span>
          {variant === "tagline" && (
            <span className="mt-1 text-[0.5rem] tracking-eyebrow uppercase opacity-60">
              Find. Evaluate. Build. Grow.
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Opportunity Index — home">
      {content}
    </Link>
  );
}
