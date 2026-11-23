import GameCard from "@/components/GameCard";
import DailyThemeIndicator from "@/components/DailyThemeIndicator";
import { games } from "@/lib/games";
import Link from "next/link";

export default function Home() {
  const firstAvailableGame = games.find((game) => game.status === "available");

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex flex-1 items-center py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
          <header className="text-center">
            <h1 id="home-title" className="text-title font-extrabold text-text-primary">
              Mini Hub
            </h1>
            <p className="mt-1 text-sm text-text-muted sm:text-body">
              Um desafio por dia. Três jogos.
            </p>
            <DailyThemeIndicator />
          </header>

          <section aria-labelledby="games-title" className="mt-7 sm:mt-10">
            <h2 id="games-title" className="sr-only">Jogos de hoje</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
              {games.map((game) => <GameCard key={game.id} game={game} />)}
            </div>
          </section>

          <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8">
            {firstAvailableGame && (
              <Link href={firstAvailableGame.route} className="group inline-flex min-h-11 w-full max-w-52 items-center justify-center gap-2 rounded-control bg-primary px-8 py-2.5 text-sm font-bold text-on-primary shadow-tactile transition hover:opacity-90 active:translate-y-0.5 active:shadow-tactile-pressed">
                Começar
                <span className="text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true">▶</span>
              </Link>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-3 py-1.5 text-xs text-text-muted">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path strokeLinecap="round" d="M12 7.5V12l3 2" />
              </svg>
              Novos desafios à meia-noite
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface-subtle px-4 py-4 text-center text-meta font-semibold uppercase tracking-wider text-text-muted">
        Daily Edition <span aria-hidden="true">•</span> Refreshes at Midnight
      </footer>
    </div>
  );
}
