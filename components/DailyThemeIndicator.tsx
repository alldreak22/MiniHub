"use client";

import { useSyncExternalStore } from "react";
import { DAILY_EDITION_CHANGE_EVENT, dailyEditionFor, dayKey } from "@/lib/dailyEdition";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(DAILY_EDITION_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DAILY_EDITION_CHANGE_EVENT, onChange);
  };
}

function currentTheme() {
  return dailyEditionFor(dayKey()).theme;
}

export default function DailyThemeIndicator({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "…");

  return (
    <div className={compact
      ? "mt-3 flex w-fit max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted"
      : "mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-muted"}
    >
      <LightbulbIcon />
      <span>
        {!compact && "Tema de hoje: "}
        <strong className="font-semibold text-text-primary">{theme}</strong>
      </span>
    </div>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6m-5 3h4m4-11a6 6 0 1 0-9.5 4.88c.78.55 1.5 1.37 1.5 2.12h4c0-.75.72-1.57 1.5-2.12A5.99 5.99 0 0 0 18 10Z" />
    </svg>
  );
}
