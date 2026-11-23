import type { LetterState } from "./engine";

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

const rows = [
  "QWERTYUIOP".split(""),
  [..."ASDFGHJKL", "Backspace"],
  [..."ZXCVBNM", "Enter"],
];

interface TermoKeyboardProps {
  keyboard: Record<string, LetterState>;
  disabled: boolean;
  onKey: (key: string) => void;
}

export default function TermoKeyboard({
  keyboard,
  disabled,
  onKey,
}: TermoKeyboardProps) {
  return rows.map((row, index) => (
    <div key={index} className="flex justify-center gap-1">
      {row.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onKey(key)}
          aria-label={
            key === "Backspace"
              ? "Apagar última letra"
              : key === "Enter"
                ? "Confirmar tentativa"
                : `${key}${keyboard[key] ? `, ${labels[keyboard[key]]}` : ""}`
          }
          className={`flex h-11 min-w-0 cursor-pointer items-center justify-center rounded border px-1 text-xs font-bold shadow-tactile transition active:translate-y-0.5 active:shadow-tactile-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-termo disabled:cursor-default ${
            key === "Backspace"
              ? "min-w-[42px] max-w-[42px] flex-1"
              : key === "Enter"
                ? "min-w-[54px] max-w-[64px] flex-[1.6]"
                : "max-w-[42px] flex-1"
          } ${
            keyboard[key]
              ? colors[keyboard[key]]
              : key === "Backspace" || key === "Enter"
                ? "border-border bg-surface-subtle text-text-primary"
                : "border-border bg-surface text-text-primary"
          }`}
        >
          {key === "Backspace" ? "⌫" : key === "Enter" ? "Enter" : key}
        </button>
      ))}
    </div>
  ));
}
