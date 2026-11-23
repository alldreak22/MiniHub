import GameHelp from "@/components/GameHelp";
import type { ReactNode } from "react";
import type { LetterState } from "./engine";

export default function TermoHelp() {
  return (
    <GameHelp gameName="Termo" compact>
      <p>Adivinhe a palavra em até 6 tentativas.</p>
      <p className="mt-1">Cada tentativa deve ser uma palavra válida de 5 letras.</p>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <HelpExample word="PEDRA" highlightedIndex={0} state="correct">
          A letra <strong className="mx-0.5 inline-flex size-5 items-center justify-center rounded-[4px] bg-termo align-middle text-[11px] font-extrabold leading-none text-white">P</strong> está na palavra e na posição correta.
        </HelpExample>
        <HelpExample word="LIVRO" highlightedIndex={2} state="present">
          A letra <strong className="mx-0.5 inline-flex size-5 items-center justify-center rounded-[4px] bg-partial align-middle text-[11px] font-extrabold leading-none text-slate-950">V</strong> está na palavra, mas em outra posição.
        </HelpExample>
        <HelpExample word="FESTA" highlightedIndex={3} state="absent">
          A letra <strong className="mx-0.5 inline-flex size-5 items-center justify-center rounded-[4px] bg-absent align-middle text-[11px] font-extrabold leading-none text-white">T</strong> não está na palavra.
        </HelpExample>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-[13px] leading-5 text-text-muted">
        As letras podem se repetir em uma mesma palavra.
      </p>
    </GameHelp>
  );
}

function HelpExample({
  word,
  highlightedIndex,
  state,
  children,
}: {
  word: string;
  highlightedIndex: number;
  state: LetterState;
  children: ReactNode;
}) {
  const highlightedClass = {
    correct: "border-termo bg-termo text-white",
    present: "border-partial bg-partial text-slate-950",
    absent: "border-absent bg-absent text-white",
  }[state];

  return (
    <div>
      <div className="flex gap-1.5" aria-label={word}>
        {[...word].map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`flex size-9 items-center justify-center rounded-control border text-lg font-extrabold shadow-sm sm:size-10 ${index === highlightedIndex ? highlightedClass : "border-border bg-surface text-text-primary"}`}
          >
            {letter}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-sm text-text-primary">{children}</p>
    </div>
  );
}
