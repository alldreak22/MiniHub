"use client";

import { useId, useRef, type ReactNode } from "react";

export default function GameHelp({
  gameName,
  children,
  compact = false,
}: {
  gameName: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        aria-label={`Ajuda do ${gameName}`}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={
          compact
            ? "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-subtle text-text-primary shadow-sm transition active:translate-y-0.5"
            : "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        }
      >
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full border border-current text-sm font-semibold"
        >
          ?
        </span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-modal="true"
        className={
          compact
            ? "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-card border border-border bg-surface p-0 text-text-primary shadow-overlay backdrop:bg-slate-950/40"
            : "fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
        }
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        // Keep game shortcuts from receiving keys while help has focus.
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className={compact ? "p-4 sm:p-6" : "p-6 sm:p-8"}>
          <div className="flex items-center justify-between gap-4">
            <h2
              id={titleId}
              className={
                compact ? "text-section font-bold" : "text-xl font-bold"
              }
            >
              {compact ? "Como jogar" : `Ajuda de ${gameName}`}
            </h2>
            <button
              type="button"
              aria-label="Fechar instruções"
              onClick={() => dialog.current?.close()}
              className={
                compact
                  ? "flex size-8 cursor-pointer items-center justify-center rounded-full text-xl text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
                  : "min-h-11 cursor-pointer rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              }
            >
              {compact ? (
                <span className="-translate-y-[2px] leading-none">×</span>
              ) : (
                "Fechar"
              )}
            </button>
          </div>
          <div
            className={
              compact
                ? "mt-3 text-sm leading-5 text-text-muted"
                : "mt-4 text-sm leading-6 text-slate-600"
            }
          >
            {children}
          </div>
          {compact && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="cursor-pointer rounded-control bg-primary px-4 py-2 text-label font-bold text-on-primary shadow-sm transition hover:opacity-90 active:scale-95"
              >
                Entendi
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
