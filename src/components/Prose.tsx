/** Editorial text column with consistent rhythm across the static pages. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl space-y-4 leading-relaxed [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-[var(--fg-muted)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
