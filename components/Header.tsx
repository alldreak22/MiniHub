import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Navegação principal" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <Link href="/" className="rounded-sm text-lg font-bold tracking-tight text-slate-950">
          Mini Hub<span className="text-indigo-600">.</span>
        </Link>
        <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
          Início
        </Link>
      </nav>
    </header>
  );
}
