"use client";

import { useState, type FormEvent } from "react";
import { trackEmailSignup } from "@/lib/analytics/client";

interface NewsletterFormProps {
  /** `stacked` puts the button under the field, for narrow rails. */
  layout?: "inline" | "stacked";
  /** Where the signup happened, recorded against the subscriber. */
  source?: string;
  className?: string;
}

export function NewsletterForm({
  layout = "inline",
  source = "web",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      trackEmailSignup(source);
      setStatus("done");
      setEmail("");
      setConsent(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <p className={`text-sm ${className}`} style={{ color: "var(--fg-muted)" }}>
        Thanks — check your inbox to confirm your subscription.
      </p>
    );
  }

  const fieldId = `newsletter-${layout}-${source}`;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`flex gap-2 ${layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"}`}>
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
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
          disabled={status === "sending"}
          className="shrink-0 rounded-[var(--radius-brand)] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "var(--bg-inverse)", color: "var(--fg-inverse)" }}
        >
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Explicit consent. The server refuses a signup without it. */}
      <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-xs">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
        />
        <span style={{ color: "var(--fg-faint)" }}>
          Email me the weekly newsletter. Unsubscribe any time.
        </span>
      </label>

      {error && (
        <p className="mt-2 text-xs" role="alert" style={{ color: "var(--score-mid-fg)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
