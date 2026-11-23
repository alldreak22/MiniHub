"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { games } from "@/lib/games";
import { DAILY_EDITION_CHANGE_EVENT, changeDailyEdition, dayKey } from "@/lib/dailyEdition";
import { clearGameProgress } from "@/lib/storage";
import { ConexoesDebugReset, ConexoesDebugSolve } from "@/app/games/conexoes/ConexoesDebug";
import { CronologiaDebugReset, CronologiaDebugSolve } from "@/app/games/cronologia/CronologiaDebug";
import {
  TermoDebugInfo,
  TermoDebugReset,
} from "@/app/games/termo/TermoDebug";

export default function DebugMenu() {
  const router = useRouter();
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") return null;

  function resetAll() {
    try {
      clearGameProgress(localStorage);
      router.push("/");
      router.refresh();
    } catch {
      setError("Não foi possível redefinir o progresso dos jogos.");
    }
  }

  function switchDailyEdition() {
    try {
      changeDailyEdition(localStorage, dayKey());
      window.dispatchEvent(new Event(DAILY_EDITION_CHANGE_EVENT));
      router.push("/");
      router.refresh();
    } catch {
      setError("Não foi possível trocar o tema do dia.");
    }
  }

  return (
    <aside
      aria-label="Ferramentas de desenvolvimento"
      className="fixed right-4 top-16 z-50 max-w-[calc(100vw-2rem)] md:left-[calc(14rem+0.75rem)] md:right-auto md:top-4"
    >
      <details className="relative text-white">
        <summary className="min-h-11 w-40 cursor-pointer rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold shadow-xl">
          Menu de debug
        </summary>

        <nav
          aria-label="Atalhos de desenvolvimento"
          className="absolute right-0 top-[calc(100%+0.5rem)] max-h-[75dvh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xl md:left-0 md:right-auto"
        >
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={resetAll} className="cursor-pointer rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">
              Redefinir tudo
            </button>
            <button type="button" onClick={switchDailyEdition} className="cursor-pointer rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">
              Trocar tema do dia
            </button>
          </div>

          {error && <p role="alert" className="mt-2 px-3 text-xs text-red-300">{error}</p>}

          <div className="mt-2 border-t border-slate-800" />

          {games.map((game) => (
            <section
              key={game.id}
              className="border-b border-slate-800 py-3"
            >
              {/* Cabeçalho do jogo */}
              <div className="mb-2 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-300"
                  >
                    {game.name.charAt(0)}
                  </span>

                  <span className="text-sm font-semibold">
                    {game.name}
                  </span>
                </div>

                {game.id === "termo" && <TermoDebugReset />}
                {game.id === "conexoes" && <ConexoesDebugReset />}
                {game.id === "cronologia" && <CronologiaDebugReset />}
              </div>

              {/* Informações específicas */}
              {game.id === "termo" && (
                <div className="mb-2 px-3">
                  <TermoDebugInfo />
                </div>
              )}

              {/* Atalhos */}
              {game.id === "conexoes" && <ConexoesDebugSolve />}
              {game.id === "cronologia" && <CronologiaDebugSolve />}
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  href={game.route}
                  className="rounded-md bg-slate-800 px-3 py-2 text-center text-sm hover:bg-slate-700"
                >
                  Jogo
                </Link>

                <Link
                  href={`${game.route}/resultado`}
                  className="rounded-md bg-slate-800 px-3 py-2 text-center text-sm hover:bg-slate-700"
                >
                  Resultado
                </Link>
              </div>
            </section>
          ))}

          <Link
            href="/resumo"
            className="mt-3 block rounded-md bg-slate-800 px-3 py-2 text-center text-sm font-semibold hover:bg-slate-700"
          >
            Resumo final
          </Link>
        </nav>
      </details>
    </aside>
  );
}
