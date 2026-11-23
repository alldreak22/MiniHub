"use client";

import { useState } from "react";
import { createState, dayKey, puzzleFor, STORAGE_KEY, type GameState } from "./engine";

export function ConexoesDebugSolve() {
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") return null;

  function solve() {
    try {
      // Uma partida nova permite resolver também após uma derrota, sem salvar vitória com quatro erros.
      const state = createState(dayKey());
      const solved: GameState = {
        ...state,
        found: puzzleFor(state.day).groups.map((_, index) => index),
        status: "won",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
      // Recarrega o estado persistido mesmo quando o resultado já está aberto.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/games/conexoes/resultado";
    } catch {
      setError("Não foi possível salvar a solução do Conexões.");
    }
  }

  return (
    <div className="mb-2 px-3">
      <button type="button" onClick={solve} className="min-h-8 w-full rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">Resolver</button>
      {error && <p role="alert" className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function ConexoesDebugReset() {
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") return null;

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // A recarga completa descarta o estado React, inclusive ao resetar na própria rota.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/games/conexoes";
    } catch {
      setError("Não foi possível apagar o estado do Conexões.");
    }
  }

  return (
    <>
      <button type="button" onClick={reset} title="Resetar Conexões" aria-label="Resetar Conexões" className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-800 hover:text-white">↻</button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </>
  );
}
