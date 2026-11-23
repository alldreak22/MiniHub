import GameHelp from "@/components/GameHelp";

export default function CronologiaHelp() {
  return (
    <GameHelp gameName="Cronologia" compact>
      <p>Organize os eventos do mais antigo para o mais recente.</p>
      <p className="mt-1">Arraste o evento atual para uma das posições da linha do tempo.</p>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <HelpExample label="Marco inicial" year="1972" />
        <HelpExample label="Posição correta" year="1985" outcome="correct" />
        <HelpExample label="Posição corrigida" year="1989" outcome="incorrect" />
      </div>

      <div className="mt-4 border-t border-border pt-4 text-[13px] leading-5 text-text-muted">
        <p>Você pode cometer até 3 erros por partida.</p>
        <p>Um evento incorreto é reposicionado automaticamente e permanece marcado em vermelho.</p>
        <p>Os anos são revelados após a primeira tentativa.</p>
      </div>
    </GameHelp>
  );
}

function HelpExample({ label, year, outcome }: { label: string; year: string; outcome?: "correct" | "incorrect" }) {
  const style = outcome === "correct"
    ? "border-success bg-success text-white"
    : outcome === "incorrect"
      ? "border-error bg-error text-white"
      : "border-border-strong bg-surface-subtle text-cronologia-strong";

  return (
    <div className="flex items-center gap-3">
      <div className="flex min-h-12 flex-1 items-center justify-center rounded-control border border-border bg-surface px-2 text-center text-xs font-bold text-text-primary shadow-sm">
        Evento
      </div>
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-cronologia" />
      <span className={`rounded-control border px-2.5 py-1 text-xs font-bold shadow-sm ${style}`}>{year}</span>
      <span className="w-28 text-xs text-text-primary">{label}</span>
    </div>
  );
}
