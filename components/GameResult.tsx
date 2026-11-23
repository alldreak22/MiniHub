import Link from "next/link";
import { getGameStep } from "@/lib/games";

export default function GameResult({ gameId }: { gameId: string }) {
  const { game, position, total, nextGame } = getGameStep(gameId);

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-semibold text-indigo-700">Jogo {position} de {total} · Resultado</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Resultado de {game.name}</h1>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="font-semibold">Prévia do resultado</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">O resultado aparecerá aqui quando o jogo estiver implementado. Esta demonstração não avalia respostas nem registra pontuação.</p>
      </div>
      <p className="mt-6 text-sm text-slate-600">{nextGame ? `A seguir: ${nextGame.name}.` : "Você chegou ao último jogo da sequência."}</p>
      <Link href={nextGame?.route ?? "/resumo"} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">{nextGame ? "Próximo jogo" : "Ver resumo final"}</Link>
    </section>
  );
}
