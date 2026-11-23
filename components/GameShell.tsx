"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { games } from "@/lib/games";
import DailyThemeIndicator from "./DailyThemeIndicator";
import { VISUAL_THEME_STORAGE_KEY } from "@/lib/storage";

interface GameShellProps {
  activeGameId: string;
  children: ReactNode;
}

export default function GameShell({ activeGameId, children }: GameShellProps) {
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;

    const closeOnDesktop = () => {
      if (window.matchMedia("(min-width: 768px)").matches && dialog.open) {
        dialog.close();
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col justify-between border-r border-border bg-surface-subtle px-3 py-5 md:flex">
        <Navigation activeGameId={activeGameId} />
        <ThemeControls />
      </aside>

      <button
        type="button"
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        onClick={() => drawer.current?.showModal()}
        className="fixed left-4 top-4 z-30 flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-sm transition active:translate-y-0.5 md:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={drawer}
        aria-label="Navegação dos jogos"
        onClick={(event) => {
          if (event.target === event.currentTarget) drawer.current?.close();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-slate-950/35 md:hidden"
      >
        <div className="flex h-full w-64 flex-col justify-between border-r border-border bg-surface-subtle px-3 py-5 shadow-overlay">
          <div>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => drawer.current?.close()}
              className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-xl text-text-muted hover:bg-surface hover:text-text-primary"
            >
              ×
            </button>
            <Navigation activeGameId={activeGameId} onNavigate={() => drawer.current?.close()} />
          </div>
          <ThemeControls />
        </div>
      </dialog>

      <div className="min-h-screen md:pl-56">{children}</div>
    </div>
  );
}

function Navigation({ activeGameId, onNavigate }: { activeGameId: string; onNavigate?: () => void }) {
  return (
    <div>
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2 px-2 text-sm font-bold text-text-primary">
        <span className="grid size-7 grid-cols-2 gap-0.5 rounded-control bg-primary p-1.5" aria-hidden="true">
          <span className="rounded-[1px] bg-on-primary" />
          <span className="rounded-[1px] bg-on-primary" />
          <span className="rounded-[1px] bg-on-primary" />
          <span className="rounded-[1px] bg-on-primary" />
        </span>
        Mini Hub
      </Link>

      <DailyThemeIndicator compact />

      <nav aria-label="Jogos" className="mt-4 space-y-1">
        {games.map((game) => {
          const active = game.id === activeGameId;
          return (
            <Link
              key={game.id}
              href={game.route}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm transition-colors ${active ? "bg-surface text-text-primary" : "text-text-muted hover:bg-surface hover:text-text-primary"}`}
            >
              <NavigationIcon gameId={game.id} />
              {game.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavigationIcon({ gameId }: { gameId: string }) {
  if (gameId === "termo") {
    return <span className="grid size-4 grid-cols-3 gap-0.5" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <span key={index} className="rounded-[1px] bg-current" />)}</span>;
  }

  if (gameId === "conexoes") {
    return <span className="grid size-4 grid-cols-2 gap-0.5" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} className="rounded-[2px] border border-current" />)}</span>;
  }

  return (
    <span className="flex size-4 items-center" aria-hidden="true">
      <span className="size-1.5 rounded-full bg-current" />
      <span className="h-px flex-1 bg-current" />
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}

function ThemeControls() {
  const theme = useSyncExternalStore(subscribeToTheme, currentTheme, () => "system");

  function selectTheme(next: VisualTheme) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(VISUAL_THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event("mini-hub:theme-change"));
  }

  return (
    <div aria-label="Tema visual" className="grid grid-cols-3 gap-1 rounded-control bg-border p-1 text-text-muted">
      <ThemeButton label="Tema claro" selected={theme === "light"} onClick={() => selectTheme("light")}>☀</ThemeButton>
      <ThemeButton label="Tema escuro" selected={theme === "dark"} onClick={() => selectTheme("dark")}>◐</ThemeButton>
      <ThemeButton label="Tema do sistema" selected={theme === "system"} onClick={() => selectTheme("system")}>▣</ThemeButton>
    </div>
  );
}

type VisualTheme = "light" | "dark" | "system";

function isVisualTheme(value: string | null): value is VisualTheme {
  return value === "light" || value === "dark" || value === "system";
}

function currentTheme(): VisualTheme {
  const theme = document.documentElement.dataset.theme ?? null;
  return isVisualTheme(theme) ? theme : "system";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("mini-hub:theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("mini-hub:theme-change", onChange);
  };
}

function ThemeButton({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-7 cursor-pointer items-center justify-center rounded text-sm transition ${selected ? "bg-surface text-text-primary shadow-sm" : "hover:text-text-primary"}`}
    >
      {children}
    </button>
  );
}

function MenuIcon() {
  return (
    <span className="flex w-4 flex-col gap-1" aria-hidden="true">
      <span className="h-0.5 rounded-full bg-current" />
      <span className="h-0.5 rounded-full bg-current" />
      <span className="h-0.5 rounded-full bg-current" />
    </span>
  );
}
