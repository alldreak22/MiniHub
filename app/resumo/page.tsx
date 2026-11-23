import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Resumo final" };

export default function SummaryPage() {
  return (
    <section className="max-w-2xl">
      <p className="text-sm font-semibold text-indigo-700">Fim da sequência</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Resumo final</h1>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="font-semibold">Você chegou ao fim da prévia</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Aqui ficará o resumo da sua partida quando os jogos estiverem prontos. Nesta demonstração, não registramos resultados ou jogos pulados.</p>
      </div>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">Voltar à Home</Link>
    </section>
  );
}
