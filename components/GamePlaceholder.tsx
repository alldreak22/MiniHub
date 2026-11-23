import Link from "next/link";
import { getGameStep } from "@/lib/games";
import GameHelp from "@/components/GameHelp";

export default function GamePlaceholder({ gameId }: { gameId: string }) {
  const { game, position, total, nextGame } = getGameStep(gameId);

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-semibold text-indigo-700">Jogo {position} de {total}</p>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">{game.name}</h1>
        <GameHelp gameName={game.name}>
          <p>Este jogo ainda será implementado. Por enquanto, entregar abre uma prévia do resultado, e pular segue para a próxima etapa.</p>
        </GameHelp>
      </div>
      <p className="mt-4 leading-7 text-slate-600">{game.description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="font-semibold">Jogo em preparação</h2>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`${game.route}/resultado`} className="inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">Entregar</Link>
        <Link href={nextGame?.route ?? "/resumo"} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">Pular jogo</Link>
      </div>
    </section>
  );
}
