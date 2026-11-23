import type { RefObject } from "react";
import { MAX_ATTEMPTS, type LetterState } from "./engine";

const colors = {
  correct: "border-termo bg-termo text-white",
  present: "border-partial bg-partial text-slate-950",
  absent: "border-absent bg-absent text-white",
};

const labels = {
  correct: "posição correta",
  present: "outra posição",
  absent: "sem ocorrência disponível",
};

interface TermoBoardProps {
  guesses: string[];
  draft: string;
  selected: number;
  evaluations: LetterState[][];
  finished: boolean;
  result: boolean;
  shake: boolean;
  cellRefs: RefObject<(HTMLButtonElement | null)[]>;
  onCellClick: (column: number) => void;
  onCellFocus: (column: number) => void;
  onEnter: () => void;
  onShakeEnd: () => void;
}

export default function TermoBoard({
  guesses,
  draft,
  selected,
  evaluations,
  finished,
  result,
  shake,
  cellRefs,
  onCellClick,
  onCellFocus,
  onEnter,
  onShakeEnd,
}: TermoBoardProps) {
  return (
    <div
      className="mx-auto grid w-full max-w-[300px] gap-1.5 select-none sm:max-w-[340px]"
      role="group"
      aria-label="Tabuleiro de 6 tentativas"
    >
      {Array.from({ length: MAX_ATTEMPTS }, (_, row) => {
        const guess = guesses[row];
        const current = !finished && row === guesses.length;
        const letters = guess ?? (current ? draft : "");
        const evaluation = evaluations[row] ?? null;

        return (
          <div
            key={row}
            onAnimationEnd={onShakeEnd}
            className={`grid grid-cols-5 gap-1.5 ${current && shake ? "termo-shake" : ""}`}
            role="group"
            aria-label={`Tentativa ${row + 1}`}
          >
            {Array.from({ length: 5 }, (_, column) =>
              current && !result ? (
                <button
                  ref={(element) => {
                    cellRefs.current[column] = element;
                  }}
                  key={column}
                  type="button"
                  onClick={() => onCellClick(column)}
                  onFocus={() => onCellFocus(column)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.stopPropagation();
                      onEnter();
                    }
                  }}
                  aria-label={`Posição ${column + 1}: ${letters[column]?.trim() || "vazia"}`}
                  aria-pressed={selected === column}
                  className={`flex aspect-square cursor-pointer items-center justify-center rounded-control border-2 bg-surface text-xl font-extrabold text-text-primary shadow-sm transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus:outline-none sm:text-2xl ${
                    selected === column
                      ? "border-termo ring-2 ring-termo-subtle"
                      : "border-border-strong"
                  }`}
                >
                  {letters[column]}
                </button>
              ) : (
                <span
                  key={column}
                  className={`flex aspect-square items-center justify-center rounded-control border-2 text-xl font-extrabold shadow-sm sm:text-2xl ${evaluation ? colors[evaluation[column]] : current ? "border-border-strong bg-surface text-text-primary" : "border-transparent bg-surface-subtle text-text-primary"}`}
                  aria-label={`${column + 1}: ${letters[column] ?? "vazia"}${evaluation ? `, ${labels[evaluation[column]]}` : ""}`}
                >
                  {letters[column]}
                </span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
