import Link from "next/link";
import { Icon } from "./Icon";
import { Mark } from "./Logo";

interface HorizonCardProps {
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  minHeight?: string;
}

/**
 * The dark "earth horizon" panel from the brand imagery, built entirely in CSS
 * so there is no hero image to load. Always dark, in both site themes.
 */
export function HorizonCard({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  className = "",
  minHeight = "18rem",
}: HorizonCardProps) {
  return (
    <div
      className={`horizon-scene relative isolate overflow-hidden rounded-[var(--radius-brand)] ${className}`}
      style={{ minHeight }}
    >
      <span className="horizon-beam" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col p-6 text-white sm:p-8" style={{ minHeight }}>
        <div className="flex items-center gap-3">
          <Mark size={26} beam={false} idPrefix="horizon" className="text-white" />
          {eyebrow && (
            <span className="text-[0.6rem] font-semibold tracking-eyebrow text-blue-300 uppercase">
              {eyebrow}
            </span>
          )}
        </div>

        <div className="mt-auto pt-10">
          <h2 className="max-w-sm text-xl leading-snug font-medium sm:text-2xl">{title}</h2>
          {body && <p className="mt-2 max-w-md text-sm text-white/70">{body}</p>}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-brand)] bg-white px-4 py-2.5 text-sm font-semibold text-[#0d1117] transition-opacity hover:opacity-90"
            >
              {ctaLabel}
              <Icon name="arrowRight" size={15} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
