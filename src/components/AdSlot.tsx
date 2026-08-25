type AdFormat = "leaderboard" | "in-content" | "half-page" | "in-feed" | "mobile-leaderboard";

const FORMATS: Record<AdFormat, { size: string; name: string; minHeight: number }> = {
  leaderboard: { size: "728 x 90", name: "Leaderboard", minHeight: 90 },
  "in-content": { size: "728 x 90", name: "In-Content Banner", minHeight: 90 },
  "half-page": { size: "300 x 600", name: "Half Page", minHeight: 600 },
  "in-feed": { size: "300 x 250", name: "In-feed Ad", minHeight: 250 },
  "mobile-leaderboard": { size: "728 x 90", name: "Leaderboard Ad", minHeight: 60 },
};

interface AdSlotProps {
  format: AdFormat;
  /** Extra qualifier shown after the format name, e.g. "Every 15 Rows". */
  note?: string;
  className?: string;
}

/**
 * A reserved advertising placement. It renders a labelled, correctly-sized
 * container so layout never shifts when a real creative is dropped in.
 */
export function AdSlot({ format, note, className = "" }: AdSlotProps) {
  const spec = FORMATS[format];
  return (
    <aside
      aria-label="Advertisement"
      className={`flex flex-col items-center justify-center rounded-[var(--radius-brand)] border border-dashed px-4 py-3 text-center ${className}`}
      style={{
        backgroundColor: "var(--ad-bg)",
        borderColor: "var(--ad-border)",
        minHeight: spec.minHeight,
      }}
    >
      <span
        className="text-[0.6rem] font-medium tracking-eyebrow uppercase"
        style={{ color: "var(--ad-fg)" }}
      >
        Advertising Space
      </span>
      <span className="mt-1.5 text-xs" style={{ color: "var(--ad-fg)" }}>
        <span className="font-semibold">{spec.size}</span> {spec.name}
        {note ? ` (${note})` : ""}
      </span>
    </aside>
  );
}
