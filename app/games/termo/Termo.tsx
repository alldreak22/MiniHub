"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import GameShell from "@/components/GameShell";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getGameStep } from "@/lib/games";
import {
  answerFor,
  dayKey,
  enterKey,
  evaluate,
  isValidWord,
  isFinished,
  restore,
  selectCell,
  STORAGE_KEY,
  type GameState,
  type LetterState,
} from "./engine";
import TermoBoard from "./TermoBoard";
import TermoHelp from "./TermoHelp";
import TermoKeyboard from "./TermoKeyboard";

const priority = { absent: 1, present: 2, correct: 3 };
const subscribe = () => () => {};

export default function Termo({ result = false }: { result?: boolean }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? (
    <Session result={result} />
  ) : (
    <p role="status">Carregando Termo…</p>
  );
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
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [shake, setShake] = useState(false);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const { nextGame } = getGameStep("termo");
  const answer = answerFor(state.day);
  const won = state.guesses.includes(answer);
  const finished = isFinished(state);

  function showError(message: string) {
    setMessage(message);
    setShake(false);

    requestAnimationFrame(() => {
      setShake(true);
    });
  }

  const save = useCallback((next: GameState) => {
    setMessage("");
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    if (!result && finished && !storageError)
      router.replace("/games/termo/resultado");
  }, [result, finished, storageError, router]);

  useEffect(() => {
    if (result || finished) return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      mobileInputRef.current?.focus();
      return;
    }
    cellRefs.current[state.selected]?.focus();
  }, [state.selected, result, finished]);

  const play = useCallback(
    (key: string) => {
      if (result || isFinished(state)) return;

      if (key === "Enter") {
        if (!/^[A-Z]{5}$/.test(state.draft)) {
          showError("Preencha todas as letras");
          return;
        }

        if (!isValidWord(state.draft)) {
          showError("Palavra não encontrada");
          return;
        }
      }

      save(enterKey(state, key));
    },
    [result, state, save],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.isComposing ||
        event.repeat
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      )
        return;
      // Preserve native Enter activation for focused links and buttons.
      if (
        event.key === "Enter" &&
        target instanceof HTMLElement &&
        target.closest("a, button, summary")
      )
        return;
      if (
        event.key === "Enter" ||
        event.key === "Backspace" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        /^[a-zà-ü]$/i.test(event.key)
      ) {
        if (result || finished) return;
        event.preventDefault();
        play(event.key);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, result, finished]);

  const evaluations = state.guesses.map((guess) => evaluate(guess, answer));
  const keyboard: Record<string, LetterState> = {};
  state.guesses.forEach((guess, guessIndex) =>
    evaluations[guessIndex].forEach((color, index) => {
      const letter = guess[index];
      if (!keyboard[letter] || priority[color] > priority[keyboard[letter]])
        keyboard[letter] = color;
    }),
  );
  const status = won
    ? `Você acertou em ${state.guesses.length} de 6 tentativas! Palavra: ${answer}.`
    : finished
      ? `Fim das tentativas. A palavra era ${answer}.`
      : result
        ? "A partida ainda não terminou. Continue para descobrir a palavra."
        : `Tentativa ${state.guesses.length + 1} de 6`;

  function handleCellClick(column: number) {
    save(selectCell(state, column));
    if (window.matchMedia("(max-width: 767px)").matches) {
      mobileInputRef.current?.focus();
    }
  }

  function handleCellFocus(column: number) {
    save(selectCell(state, column));
  }

  return (
    <GameShell activeGameId="termo">
      <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
        <section className="flex w-full max-w-[500px] flex-col items-center">
          <header className="flex w-full items-center justify-between border-b border-border pb-3">
            <div>
              <h1 className="text-title font-extrabold tracking-tight text-text-primary">
                {result ? "Resultado" : "Termo"}
              </h1>
            </div>
            <TermoHelp />
          </header>

          <div className="flex h-8 w-full items-center justify-center">
            {message ? (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary" role="status" aria-live="polite">
                {message}
              </span>
            ) : (
              <span className="sr-only" role="status" aria-live="polite">{status}</span>
            )}
          </div>

          {!result && !finished && (
            <input
              ref={mobileInputRef}
              aria-label="Digitar palavra"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              inputMode="text"
              spellCheck={false}
              value=""
              onChange={(event) => {
                const letter = event.currentTarget.value.at(-1);
                if (letter) play(letter);
              }}
              onKeyDown={(event) => {
                if (["Enter", "Backspace", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                  event.preventDefault();
                  play(event.key);
                }
              }}
              className="absolute size-px opacity-0 md:hidden"
            />
          )}

          <TermoBoard
            guesses={state.guesses}
            draft={state.draft}
            selected={state.selected}
            evaluations={evaluations}
            finished={finished}
            result={result}
            shake={shake}
            cellRefs={cellRefs}
            onCellClick={handleCellClick}
            onCellFocus={handleCellFocus}
            onEnter={() => play("Enter")}
            onShakeEnd={() => setShake(false)}
          />

          {result && (
            <p className="mt-3 text-center text-sm font-semibold text-text-primary" role="status" aria-live="polite">
              {status}
            </p>
          )}

          {storageError && (
        <p role="alert" className="mt-3 text-center text-sm text-error">
          Não foi possível salvar neste navegador. Seu progresso será perdido ao
          sair.
        </p>
      )}
      <div
        className="mt-4 hidden min-h-36 w-full flex-col gap-1.5 select-none md:flex"
        role={result ? undefined : "group"}
        aria-label={result ? undefined : "Teclado virtual"}
        aria-hidden={result || undefined}
      >
          {!result && (
            <TermoKeyboard
              keyboard={keyboard}
              disabled={finished}
              onKey={play}
            />
          )}
        </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {result && !finished && (
          <Link
            href="/games/termo"
            className="cursor-pointer rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Continuar Termo
          </Link>
        )}
        {!result && finished && storageError && (
          <button
            type="button"
            onClick={() => save(state)}
            className="rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Tentar salvar resultado novamente
          </button>
        )}
        <Link
          href={nextGame?.route ?? "/resumo"}
          className={finished || result
            ? "cursor-pointer rounded-control border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-text-muted"
            : "cursor-pointer px-2 py-1 text-xs text-text-muted transition-colors hover:text-text-primary"}
        >
          {finished || result ? "Próximo jogo" : "Pular jogo"}
        </Link>
          </div>
        </section>
      </main>
    </GameShell>
  );
}
