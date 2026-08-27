import { Icon } from "./Icon";
import { NewsletterForm } from "./NewsletterForm";

export function NewsletterCard({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-[var(--radius-brand)] border p-5 ${className}`}
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <Icon name="mail" size={30} className="mt-0.5 shrink-0" style={{ color: "var(--fg-muted)" }} />
        <div>
          <h2 className="text-base font-semibold">Get Weekly Opportunities</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            High-potential ideas, new listings, and exclusive research.
          </p>
        </div>
      </div>
      <NewsletterForm layout="stacked" source="sidebar" className="mt-4" />
    </section>
  );
}
