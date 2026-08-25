"use client";

import { useState, type FormEvent } from "react";

interface NewsletterFormProps {
  /** `stacked` puts the button under the field, for narrow rails. */
  layout?: "inline" | "stacked";
  className?: string;
}

export function NewsletterForm({ layout = "inline", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    // No subscriber backend yet — the form confirms locally so the flow is
    // testable, and swaps to a POST when the list provider is wired up.
    setStatus("done");
    setEmail("");
  }

  if (status === "done") {
    return (
      <p className={`text-sm ${className}`} style={{ color: "var(--fg-muted)" }}>
        Thanks — check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 ${layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"} ${className}`}
    >
      <label htmlFor={`newsletter-${layout}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-${layout}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="min-w-0 flex-1 rounded-[var(--radius-brand)] border px-3 py-2.5 text-sm outline-none transition-colors"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--border-strong)",
          color: "var(--fg)",
        }}
      />
      <button
        type="submit"
        className="shrink-0 rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
      >
        Subscribe
      </button>
    </form>
  );
}
