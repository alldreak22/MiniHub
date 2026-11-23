"use client";

import { useState, useSyncExternalStore } from "react";
import { answerFor, dayKey, STORAGE_KEY } from "./engine";

const subscribe = () => () => {};

export function TermoDebugInfo() {
  const day = useSyncExternalStore(
    subscribe,
    () => dayKey(),
    () => "",
  );

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <p className="text-xs text-slate-400">
      Resposta:{" "}
      <strong className="text-slate-200">{day ? answerFor(day) : "…"}</strong>
    </p>
  );
}

export function TermoDebugReset() {
  const [error, setError] = useState("");

  if (process.env.NODE_ENV !== "development") return null;

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/games/termo";
    } catch {
      setError("Não foi possível apagar o estado do Termo.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={reset}
        title="Resetar Termo"
        aria-label="Resetar Termo"
        className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        ↻
      </button>

      {error && <span className="sr-only">{error}</span>}
    </>
  );
}
