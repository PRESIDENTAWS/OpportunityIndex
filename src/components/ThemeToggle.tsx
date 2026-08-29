"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";

type Theme = "light" | "dark";

const THEME_EVENT = "oi-theme-change";

/**
 * The theme lives on the <html> element, where the no-flash script sets it
 * before hydration. Subscribing to it rather than mirroring it into state keeps
 * the first client render identical to the server's.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** The server cannot know the visitor's choice, so it renders the light state. */
function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function apply(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("oi-theme", next);
    } catch {
      // Private browsing or blocked storage — the toggle still works for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border p-0.5 ${className}`}
      style={{ borderColor: "var(--border)" }}
    >
      {(["light", "dark"] as const).map((option) => {
        const active = theme === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => apply(option)}
            aria-label={`${option === "light" ? "Light" : "Dark"} theme`}
            aria-pressed={active}
            className="rounded-full p-1.5 transition-colors"
            style={{
              backgroundColor: active ? "var(--bg-inset)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-faint)",
            }}
          >
            <Icon name={option === "light" ? "sun" : "moon"} size={17} />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Runs before first paint to avoid a flash of the wrong theme. Kept as a raw
 * string because it has to execute ahead of hydration.
 */
export const themeScript = `(function(){try{var s=localStorage.getItem('oi-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
