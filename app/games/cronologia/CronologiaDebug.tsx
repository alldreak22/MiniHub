"use client";

import { useState } from "react";
import { dayKey, solveState, STORAGE_KEY } from "./engine";

export function CronologiaDebugSolve() {
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") return null;

  function solve() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solveState(dayKey())));
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/games/cronologia/resultado";
    } catch {
      setError("Não foi possível salvar a solução do Cronologia.");
    }
  }

  return (
    <div className="mb-2 px-3">
      <button type="button" onClick={solve} className="min-h-8 w-full rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">Resolver</button>
      {error && <p role="alert" className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function CronologiaDebugReset() {
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") return null;

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/games/cronologia";
    } catch {
      setError("Não foi possível apagar o estado do Cronologia.");
    }
  }

  return (
    <>
      <button type="button" onClick={reset} title="Resetar Cronologia" aria-label="Resetar Cronologia" className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-800 hover:text-white">↻</button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </>
  );
}
