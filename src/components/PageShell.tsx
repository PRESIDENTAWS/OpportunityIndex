import Link from "next/link";
import { Icon } from "./Icon";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="border-b py-8 lg:py-10" style={{ borderColor: "var(--border)" }}>
      <div className="container-oi">
        {eyebrow && (
          <p
            className="text-[0.65rem] font-semibold tracking-eyebrow uppercase"
            style={{ color: "var(--fg-faint)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--fg-muted)" }}>
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
      {trail.map((crumb, index) => (
        <span key={crumb.label} className="flex items-center gap-1.5">
          {crumb.href ? (
            <Link href={crumb.href} className="hover:underline" style={{ color: "var(--fg-muted)" }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: "var(--fg-faint)" }}>{crumb.label}</span>
          )}
          {index < trail.length - 1 && (
            <Icon name="chevronRight" size={11} style={{ color: "var(--fg-faint)" }} />
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeading({
  title,
  action,
  count,
}: {
  title: string;
  action?: { label: string; href: string };
  count?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-bold lg:text-xl">{title}</h2>
        {count && (
          <span className="text-sm" style={{ color: "var(--fg-faint)" }}>
            {count}
          </span>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          {action.label}
          <Icon name="arrowRight" size={14} />
        </Link>
      )}
    </div>
  );
}

/** Bordered card used for stat tiles and small feature blocks. */
export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag
      className={`rounded-[var(--radius-brand)] border ${className}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      {children}
    </Tag>
  );
}
