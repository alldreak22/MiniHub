"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import GameShell from "@/components/GameShell";
import { getGameStep } from "@/lib/games";
import { clearErrorSelection, dayKey, MAX_ERRORS, MAX_HINTS, moveWord, puzzleFor, restore, shuffleWords, STORAGE_KEY, toggleWord, revealHint, type GameState } from "./engine";
import ConexoesHelp from "./ConexoesHelp";
import WordGrid from "./WordGrid";

const subscribe = () => () => {};
const groupColors = [
  "bg-conexoes-amber-subtle",
  "bg-conexoes-indigo-subtle",
  "bg-termo-subtle",
  "bg-cronologia-subtle",
];

export default function Conexoes({ result = false }: { result?: boolean }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <Session result={result} /> : <p role="status">Carregando Conexões…</p>;
}

function Session({ result }: { result: boolean }) {
  const router = useRouter();
  const [state, setState] = useState(() => {
    try {
      return restore(localStorage.getItem(STORAGE_KEY), dayKey());
    } catch {
      return restore(null, dayKey());
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [hintWords, setHintWords] = useState<string[]>([]);
  const { position, total, nextGame } = getGameStep("conexoes");
  const puzzle = puzzleFor(state.day);
  const finished = state.status !== "playing";
  const feedback = !result && state.selected.length === 4;
  const showAnswer = finished && !feedback && (result || storageError);
  const visibleGroups = showAnswer
    ? [...state.found, ...puzzle.groups.map((_, index) => index).filter((index) => !state.found.includes(index))]
    : state.found;

  const save = useCallback((next: GameState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    if (!result && finished && !feedback && !storageError) router.replace("/games/conexoes/resultado");
  }, [result, finished, feedback, storageError, router]);

  useEffect(() => {
    if (!feedback) return;
    // Independente da animação: também limpa com movimento reduzido ou após restaurar.
    const timer = window.setTimeout(() => save(clearErrorSelection(state)), 550);
    return () => window.clearTimeout(timer);
  }, [feedback, state, save]);

  useEffect(() => {
    if (hintWords.length === 0) return;
    const timer = window.setTimeout(() => setHintWords([]), 200);
    return () => window.clearTimeout(timer);
  }, [hintWords]);

  function showHint() {
    const next = revealHint(state);
    if (next === state) return;
    save(next);
    setHintWords(next.hints[next.hints.length - 1].words);
  }

  return (
    <GameShell activeGameId="conexoes">
      <main className="flex min-h-screen items-center justify-center px-3 py-16 sm:px-6 md:py-8">
        <section className="w-full max-w-[760px] select-none">
          <header className="flex items-center justify-between border-b border-border pb-2">
            <h1 className="text-title font-bold tracking-tight text-text-primary">
              {result ? "Resultado" : "Conexões"}
            </h1>
            <ConexoesHelp />
          </header>

          {result && (
            <p className="mt-3 text-sm font-semibold text-text-muted">
              Jogo {position} de {total} · {state.day.split("-").reverse().join("/")}
            </p>
          )}

          {showAnswer && <h2 className="mt-4 text-sm font-semibold">Resposta completa</h2>}

          <div className="mt-3 space-y-2">
            {visibleGroups.map((index) => (
              <div key={index} className={`rounded-card border border-border px-3 py-2.5 text-center text-text-primary ${groupColors[index]}`}>
                {showAnswer && <p className="text-meta uppercase tracking-wider text-text-muted">{state.found.includes(index) ? "Encontrado" : "Não encontrado"}</p>}
                <h2 className="text-sm font-bold uppercase tracking-wide">{puzzle.groups[index].title}</h2>
                <p className="mt-0.5 text-xs leading-5 sm:text-sm">{puzzle.groups[index].words.join(", ")}</p>
              </div>
            ))}
          </div>

          {showAnswer && (
            <p className="mt-3 text-sm text-text-muted" role="status">{state.found.length} de 4 grupos encontrados · Erros: {state.errors} de {MAX_ERRORS}</p>
          )}

          {!result && (!finished || feedback) && (
            <>
              <div className="mt-3 flex items-center justify-between px-0.5">
                <span className="text-meta font-bold uppercase tracking-wider text-text-muted">Erros restantes</span>
                <span aria-label={`${MAX_ERRORS - state.errors} de ${MAX_ERRORS} erros restantes`} className="flex gap-1.5">
                  {Array.from({ length: MAX_ERRORS }, (_, index) => (
                    <span aria-hidden="true" key={index} className={`size-2 rounded-full border border-border-strong ${index < MAX_ERRORS - state.errors ? "bg-text-primary" : "bg-transparent"}`} />
                  ))}
                </span>
              </div>
              <WordGrid state={state} feedback={feedback} hintWords={hintWords} onSelect={(word) => save(toggleWord(state, word))} onMove={(word, target) => save(moveWord(state, word, target))} />
              <p role="status" className="sr-only">{feedback ? "Essas palavras não formam um grupo." : `${state.selected.length} palavras selecionadas. ${state.found.length} grupos encontrados. ${MAX_HINTS - state.hints.length} dicas restantes.`}</p>
              <div className="mx-auto mt-4 flex w-full max-w-sm gap-2">
                <button type="button" disabled={feedback || finished} onClick={() => save(shuffleWords(state))} className="min-h-10 flex-1 cursor-pointer rounded-control border border-border-strong bg-surface px-3 text-label font-semibold text-text-primary shadow-tactile transition enabled:hover:border-text-muted enabled:active:translate-y-0.5 enabled:active:shadow-tactile-pressed disabled:cursor-default disabled:opacity-40"><span aria-hidden="true" className="mr-1.5">↝</span>Misturar</button>
                <button type="button" disabled={feedback || finished || state.hints.length === MAX_HINTS} onClick={showHint} className="min-h-10 flex-1 cursor-pointer rounded-control border border-border-strong bg-surface px-3 text-label font-semibold text-text-primary shadow-tactile transition enabled:hover:border-text-muted enabled:active:translate-y-0.5 enabled:active:shadow-tactile-pressed disabled:cursor-default disabled:opacity-40"><span aria-hidden="true" className="mr-1.5">♢</span>Dica ({MAX_HINTS - state.hints.length}/{MAX_HINTS})</button>
              </div>
            </>
          )}
          {result && !finished && <p className="mt-4 text-text-muted">A partida ainda não terminou. Continue para descobrir os grupos.</p>}
          {storageError && <p role="alert" className="mt-4 text-sm text-error">Não foi possível salvar neste navegador. Seu progresso será perdido ao sair.</p>}
          <div className={`mt-3 flex flex-wrap justify-center gap-3 ${!result && !finished ? "" : "sm:justify-start"}`}>
            {result && !finished && <Link href="/games/conexoes" className="cursor-pointer rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary">Continuar Conexões</Link>}
            {!result && finished && storageError && <button type="button" onClick={() => save(state)} className="cursor-pointer rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary">Tentar salvar resultado novamente</button>}
            <Link href={nextGame?.route ?? "/resumo"} className={finished || result ? "cursor-pointer rounded-control border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-text-muted" : "cursor-pointer px-2 py-1 text-xs text-text-muted transition-colors hover:text-text-primary"}>{finished || result ? "Próximo jogo" : "Pular jogo"}</Link>
          </div>
        </section>
      </main>
    </GameShell>
  );
}
