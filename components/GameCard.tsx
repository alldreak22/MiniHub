import type { GameDefinition } from "@/types/game";
import Link from "next/link";

interface GameCardProps {
  game: GameDefinition;
}

export default function GameCard({ game }: GameCardProps) {
  const isAvailable = game.status === "available";
  const cardClassName =
    "group relative grid min-h-28 grid-cols-[2.25rem_minmax(0,1fr)_2rem] gap-x-3 gap-y-1 rounded-card border border-border bg-surface p-3 transition duration-200 sm:flex sm:min-h-64 sm:flex-col sm:p-5 sm:hover:-translate-y-1 sm:hover:shadow-sm";

  const content = (
    <>
      {game.badge && (
        <span className="absolute left-5 top-5 hidden rounded-full bg-conexoes-amber-subtle px-2 py-1 text-meta font-bold uppercase text-conexoes-amber sm:inline-flex">
          {game.badge}
        </span>
      )}

      <span
        className="col-start-3 row-span-3 flex size-8 self-center justify-self-end items-center justify-center rounded-full bg-surface-subtle text-text-muted transition-colors group-hover:bg-primary group-hover:text-on-primary sm:absolute sm:right-5 sm:top-5 sm:self-auto"
        aria-hidden="true"
      >
        <span className="-translate-y-[2px] text-lg leading-none">→</span>
      </span>

      <span
        className="col-start-1 row-span-2 flex size-9 items-center justify-center rounded-control bg-surface-subtle sm:mt-10 sm:size-12"
        aria-hidden="true"
      >
        <GameIcon gameId={game.id} />
      </span>

      <span className="col-start-2 flex min-w-0 items-center gap-2 sm:mt-4">
        <span className="text-base font-bold text-text-primary sm:text-section">
          {game.name}
        </span>
        {game.badge && (
          <span className="rounded-full bg-conexoes-amber-subtle px-2 py-0.5 text-meta font-bold uppercase text-conexoes-amber sm:hidden">
            {game.badge}
          </span>
        )}
      </span>

      <span className="col-start-2 text-xs leading-4 text-text-muted sm:mt-1 sm:flex-1 sm:text-sm sm:leading-5">
        {game.description}
      </span>

      <span
        className={`col-start-2 flex items-center gap-1.5 text-meta font-bold uppercase tracking-wider sm:mt-5 ${isAvailable ? "text-success" : "text-text-muted"}`}
      >
        <span
          className={`size-1.5 rounded-full ${isAvailable ? "bg-success" : "bg-text-muted"}`}
        />
        {isAvailable ? "Disponível" : "Em breve"}
      </span>
    </>
  );

  if (!isAvailable) {
    return <article className={cardClassName}>{content}</article>;
  }

  return (
    <Link href={game.route} className={cardClassName}>
      {content}
    </Link>
  );
}

function GameIcon({ gameId }: { gameId: string }) {
  if (gameId === "termo") {
    return (
      <span className="grid size-6 grid-cols-3 gap-1">
        {[true, true, false, false, true, false, true, true, true].map(
          (active, index) => (
            <span
              key={index}
              className={`rounded-[2px] ${active ? "bg-termo" : "bg-border-strong"}`}
            />
          ),
        )}
      </span>
    );
  }

  if (gameId === "conexoes") {
    return (
      <span className="grid size-6 grid-cols-2 gap-1.5">
        <span className="rounded-sm bg-conexoes-amber" />
        <span className="rounded-sm bg-conexoes-amber/45" />
        <span className="rounded-sm bg-conexoes-amber/45" />
        <span className="rounded-sm bg-conexoes-amber" />
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center">
      <span className="size-2 rounded-full bg-cronologia" />
      <span className="h-0.5 w-2 bg-border-strong" />
      <span className="size-2 rounded-full bg-cronologia/60" />
      <span className="h-0.5 w-2 bg-border-strong" />
      <span className="size-2 rounded-full bg-cronologia/30" />
    </span>
  );
}
