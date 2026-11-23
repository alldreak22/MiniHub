import GameHelp from "@/components/GameHelp";
import type { ReactNode } from "react";

export default function ConexoesHelp() {
  return (
    <GameHelp gameName="Conexões" compact>
      <p>Encontre 4 grupos de 4 palavras que compartilham uma conexão em comum.</p>
      <p className="mt-1">Você pode cometer até 4 erros antes de encerrar a partida.</p>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <HelpExample
          words={["Ouro", "Prata", "Bronze", "Platina"]}
          variant="resolved"
        >
          Ao selecionar 4 palavras do mesmo grupo, elas são resolvidas juntas.
        </HelpExample>

        <HelpExample
          words={["Ouro", "Mocha", "Vento", "Maré"]}
          variant="selected"
        >
          Um grupo incorreto consome 1 erro.
        </HelpExample>

        <HelpExample words={["Expresso", "Pingado"]} variant="hint">
          Uma dica revela duas palavras que pertencem ao mesmo grupo.
        </HelpExample>
      </div>

      <div className="mt-4 border-t border-border pt-4 text-[13px] leading-5 text-text-muted">
        <p>Você pode usar até 2 dicas por partida.</p>
        <p>Os cards podem ser reorganizados arrastando ou usando Misturar.</p>
        <p>A 4ª palavra selecionada valida o grupo automaticamente.</p>
      </div>
    </GameHelp>
  );
}

function HelpExample({
  words,
  variant,
  children,
}: {
  words: string[];
  variant: "resolved" | "selected" | "hint";
  children: ReactNode;
}) {
  const cardClass = {
    resolved: "border-conexoes-amber bg-conexoes-amber-subtle text-text-primary",
    selected: "border-primary bg-primary text-on-primary",
    hint: "border-border-strong bg-surface text-text-primary",
  }[variant];

  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label={words.join(", ")}>
        {words.map((word) => (
          <span
            key={word}
            className={`relative flex min-h-10 items-center justify-center overflow-hidden rounded-control border px-1.5 text-center text-[11px] font-bold shadow-sm ${cardClass}`}
          >
            {variant === "hint" && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 size-4 bg-conexoes-indigo [clip-path:polygon(0_0,100%_0,100%_100%)]"
              />
            )}
            {word}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-sm text-text-primary">{children}</p>
    </div>
  );
}
