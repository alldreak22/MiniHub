"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import GameShell from "@/components/GameShell";
import { getGameStep } from "@/lib/games";
import {
  dayKey,
  INITIAL_EVENTS,
  MAX_ERRORS,
  placeCurrent,
  puzzleFor,
  restore,
  STORAGE_KEY,
  TOTAL_EVENTS,
  type GameState,
} from "./engine";
import type { TimelineEvent } from "./data/puzzles";
import CronologiaHelp from "./CronologiaHelp";

const subscribe = () => () => {};
const FEEDBACK_TIME = 650;

type Feedback = { kind: "correct" | "wrong"; eventId: string } | null;
type DragState = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  slot: number | null;
} | null;

export default function Cronologia({ result = false }: { result?: boolean }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? (
    <Session result={result} />
  ) : (
    <p role="status">Carregando Cronologia…</p>
  );
}

function Session({ result }: { result: boolean }) {
  const router = useRouter();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(() => {
    try {
      return restore(localStorage.getItem(STORAGE_KEY), dayKey());
    } catch {
      return restore(null, dayKey());
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const { position, total, nextGame } = getGameStep("cronologia");
  const puzzle = puzzleFor(state.day);
  const byId = new Map(puzzle.events.map((event) => [event.id, event]));
  const timeline = state.timeline
    .map((id) => byId.get(id))
    .filter((event) => event !== undefined);
  const current = state.currentEventId
    ? byId.get(state.currentEventId)
    : undefined;
  const finished = state.status !== "playing";

  const save = useCallback((next: GameState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    if (!result && finished && !feedback && !storageError)
      router.replace("/games/cronologia/resultado");
  }, [feedback, finished, result, router, storageError]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_TIME);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (feedback?.kind !== "wrong") return;
    const container = timelineRef.current;
    const eventCard = Array.from(
      container?.querySelectorAll<HTMLElement>("[data-event-id]") ?? [],
    ).find((element) => element.dataset.eventId === feedback.eventId);
    if (!container || !eventCard) return;

    const containerBounds = container.getBoundingClientRect();
    const cardBounds = eventCard.getBoundingClientRect();
    const left =
      container.scrollLeft +
      cardBounds.left -
      containerBounds.left -
      (containerBounds.width - cardBounds.width) / 2;
    container.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [feedback]);

  function submit(slot: number) {
    if (feedback || !current) return;
    const placement = placeCurrent(state, slot);
    if (!placement) return;
    save(placement.state);
    setFeedback({
      kind: placement.correct ? "correct" : "wrong",
      eventId: placement.eventId,
    });
    setDrag(null);
  }

  function slotAt(clientX: number, clientY: number) {
    const container = timelineRef.current;
    if (!container) return null;
    const bounds = container.getBoundingClientRect();
    if (
      clientX < bounds.left ||
      clientX > bounds.right ||
      clientY < bounds.top - 24 ||
      clientY > bounds.bottom + 24
    )
      return null;
    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-timeline-card]"),
    );
    const index = cards.findIndex(
      (card) =>
        clientX <
        card.getBoundingClientRect().left +
          card.getBoundingClientRect().width / 2,
    );
    return index === -1 ? cards.length : index;
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (feedback || !current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      slot: null,
    });
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setDrag({
      ...drag,
      x: event.clientX,
      y: event.clientY,
      slot: slotAt(event.clientX, event.clientY),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const slot = slotAt(event.clientX, event.clientY);
    setDrag(null);
    if (slot !== null) submit(slot);
  }

  return (
    <GameShell activeGameId="cronologia">
      <main className="flex min-h-screen min-w-0 items-center justify-center overflow-hidden px-3 py-16 sm:px-6 md:py-8">
        <section className="w-full min-w-0">
          <header className="flex items-center justify-between border-b border-border pb-2">
            <h1 className="text-title font-bold tracking-tight text-text-primary">
              {result ? "Resultado" : "Cronologia"}
            </h1>
            <CronologiaHelp />
          </header>

          {!result && !finished && (
            <div className="mt-3 flex items-center justify-between px-0.5">
              <span className="text-meta font-bold uppercase tracking-wider text-text-muted">
                Erros restantes
              </span>
              <span
                aria-label={`${MAX_ERRORS - state.errors} de ${MAX_ERRORS} erros restantes`}
                className="flex gap-1.5"
              >
                {Array.from({ length: MAX_ERRORS }, (_, index) => (
                  <span
                    aria-hidden="true"
                    key={index}
                    className={`size-2 rounded-full border border-border-strong ${index < MAX_ERRORS - state.errors ? "bg-text-primary" : "bg-transparent"}`}
                  />
                ))}
              </span>
            </div>
          )}

          {result && (
            <p className="mt-3 text-sm font-semibold text-text-muted">
              Jogo {position} de {total} ·{" "}
              {state.day.split("-").reverse().join("/")}
            </p>
          )}

          {!result && current && (
            <div className="mt-5 flex justify-center">
              <div
                role="button"
                tabIndex={0}
                aria-label={`${current.title}. Arraste para a linha do tempo ou escolha uma posição abaixo.`}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={() => setDrag(null)}
                className={`w-64 touch-none select-none transition motion-reduce:transition-none sm:w-72 ${drag ? "opacity-30" : "cursor-grab hover:-translate-y-0.5 hover:shadow-overlay active:cursor-grabbing"}`}
              >
                <CurrentEventCard event={current} />
              </div>
              {drag &&
                createPortal(
                  <div
                    aria-hidden="true"
                    className="pointer-events-none fixed z-50 w-64 scale-[1.02] shadow-overlay motion-reduce:scale-100 sm:w-72"
                    style={{
                      left: drag.x - drag.offsetX,
                      top: drag.y - drag.offsetY,
                    }}
                  >
                    <CurrentEventCard event={current} />
                  </div>,
                  document.body,
                )}
            </div>
          )}

          {result && (
            <h2 className="mt-4 text-sm font-semibold text-text-primary">
              {state.status === "lost"
                ? "Linha do tempo jogada"
                : "Linha do tempo completa"}
            </h2>
          )}

          <div
            ref={timelineRef}
            className={`${result ? "mt-3" : "mt-5"} w-full max-w-full overflow-x-auto overscroll-x-contain py-4`}
          >
            <div
              className={`relative flex min-w-max items-start px-1 before:absolute before:left-5 before:right-5 before:top-[12.125rem] before:h-0.5 before:bg-border-strong ${result ? "gap-5" : ""}`}
            >
              {timeline.map((event, index) => (
                <div key={event.id} className="contents">
                  {!result && !finished && (
                    <DropSlot
                      index={index}
                      active={drag?.slot === index}
                      disabled={Boolean(feedback)}
                      onSelect={submit}
                      label={`Inserir antes de ${event.title}`}
                    />
                  )}
                  <TimelineItem
                    event={event}
                    outcome={state.placementOutcomes[event.id]}
                    revealYear={state.yearsRevealed || result}
                    animate={
                      feedback?.eventId === event.id ? feedback.kind : undefined
                    }
                  />
                </div>
              ))}
              {!result && !finished && (
                <DropSlot
                  index={timeline.length}
                  active={drag?.slot === timeline.length}
                  disabled={Boolean(feedback)}
                  onSelect={submit}
                  label="Inserir no final"
                />
              )}
            </div>
          </div>

          <p
            role="status"
            className={result ? "mt-3 text-sm text-text-muted" : "sr-only"}
          >
            {result
              ? `${state.correct} de ${TOTAL_EVENTS - INITIAL_EVENTS} posicionados corretamente · Erros: ${state.errors} de ${MAX_ERRORS}`
              : feedback
                ? feedback.kind === "correct"
                  ? "Posição correta."
                  : "Posição incorreta. O evento foi colocado no lugar certo."
                : `${timeline.length} eventos na linha do tempo.`}
          </p>
          {result && !finished && (
            <p className="mt-3 text-sm text-text-muted">
              A partida ainda não terminou.
            </p>
          )}
          {storageError && (
            <p role="alert" className="mt-4 text-sm text-error">
              Não foi possível salvar neste navegador. Seu progresso será
              perdido ao sair.
            </p>
          )}

          <div
            className={`mt-5 flex flex-wrap justify-center gap-3 ${result || finished ? "sm:justify-start" : ""}`}
          >
            {result && !finished && (
              <Link
                href="/games/cronologia"
                className="cursor-pointer rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
              >
                Continuar Cronologia
              </Link>
            )}
            {!result && finished && storageError && (
              <button
                type="button"
                onClick={() => save(state)}
                className="cursor-pointer rounded-control bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
              >
                Tentar salvar resultado novamente
              </button>
            )}
            <Link
              href={nextGame?.route ?? "/resumo"}
              className={
                finished || result
                  ? "cursor-pointer rounded-control border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-text-muted"
                  : "cursor-pointer px-2 py-1 text-xs text-text-muted transition-colors hover:text-text-primary"
              }
            >
              {finished || result ? "Próximo jogo" : "Pular jogo"}
            </Link>
          </div>
        </section>
      </main>
    </GameShell>
  );
}

function CurrentEventCard({ event }: { event: TimelineEvent }) {
  return (
    <article className="flex min-h-40 w-full flex-col rounded-card border border-border-strong bg-surface px-5 py-4 text-left shadow-tactile">
      <span className="text-[9px] font-bold uppercase leading-3 tracking-[0.08em] text-cronologia-strong">
        Aguardando inserção
      </span>
      <div className="flex flex-1 flex-col justify-center py-3 text-center">
        <h2 className="text-section font-bold leading-6 text-text-primary">
          {event.title}
        </h2>
        <p className="mt-2 text-xs leading-5 text-text-muted">
          {event.description}
        </p>
      </div>
      <EventMetadata event={event} />
    </article>
  );
}

function EventCard({
  event,
  outcome,
  highlighted = false,
}: {
  event: TimelineEvent;
  outcome?: "correct" | "incorrect";
  highlighted?: boolean;
}) {
  const label = outcome === "correct" ? "Acerto" : outcome === "incorrect" ? "Corrigido" : "Marco inicial";
  const labelColor = outcome === "correct" ? "text-success" : outcome === "incorrect" ? "text-error" : "text-text-muted";

  return (
    <article
      className={`relative z-10 flex h-44 w-full flex-col rounded-card border bg-surface px-3 py-3 shadow-sm transition-shadow motion-reduce:transition-none ${highlighted ? "border-error ring-2 ring-error" : "border-border"}`}
    >
      <span className={`text-[9px] font-bold uppercase leading-3 tracking-[0.08em] ${labelColor}`}>{label}</span>
      <div className="flex flex-1 flex-col justify-center py-2 text-center">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-text-primary">
          {event.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-4 text-text-muted">
          {event.description}
        </p>
      </div>
      <EventMetadata event={event} />
    </article>
  );
}

function EventMetadata({ event }: { event: TimelineEvent }) {
  if (!event.metadata) return null;

  return (
    <div className="flex items-center justify-between gap-2 text-[10px] leading-3 text-text-muted">
      <span className="min-w-0 truncate" title={event.metadata.left}>{event.metadata.left}</span>
      {event.metadata.right && <span className="min-w-0 truncate text-right" title={event.metadata.right}>{event.metadata.right}</span>}
    </div>
  );
}

function TimelineItem({
  event,
  outcome,
  revealYear,
  animate,
}: {
  event: TimelineEvent;
  outcome?: "correct" | "incorrect";
  revealYear: boolean;
  animate?: "correct" | "wrong";
}) {
  const yearStyle =
    outcome === "correct"
      ? "border-success bg-success text-white"
      : outcome === "incorrect"
        ? "border-error bg-error text-white"
        : "border-border-strong bg-surface-subtle text-cronologia-strong";

  return (
    <div
      data-timeline-card
      data-event-id={event.id}
      className={`relative z-10 flex w-40 shrink-0 flex-col items-center sm:w-44 ${animate === "correct" ? "cronologia-correct" : animate === "wrong" ? "cronologia-wrong" : ""}`}
    >
      <EventCard event={event} outcome={outcome} highlighted={animate === "wrong"} />
      <span
        aria-hidden="true"
        className={`relative z-10 mt-3 size-3 rounded-full ${outcome === "correct" ? "bg-success" : outcome === "incorrect" ? "bg-error" : "bg-cronologia"}`}
      />
      <p
        aria-label={revealYear ? `Ano: ${event.year}` : "Ano oculto"}
        className={`mt-3 w-fit min-w-16 rounded-control border px-2.5 py-1 text-center text-sm font-bold shadow-sm ${yearStyle}`}
      >
        {revealYear ? event.year : "••••"}
      </p>
    </div>
  );
}

function DropSlot({
  index,
  active,
  disabled,
  onSelect,
  label,
}: {
  index: number;
  active: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`group relative z-20 mx-1 flex h-52 shrink-0 cursor-pointer items-center justify-center rounded-control transition-[width,background-color] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-cronologia ${
        active
          ? "w-20 bg-cronologia-subtle"
          : "w-10 bg-surface hover:bg-cronologia-subtle focus-visible:w-14 sm:w-12"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-6 items-center justify-center rounded-full text-sm font-bold shadow-sm transition motion-reduce:transition-none ${
          active
            ? "scale-110 bg-cronologia text-white"
            : "bg-surface-subtle text-text-muted group-hover:bg-cronologia group-hover:text-white"
        }`}
      >
        <span className="-translate-y-[2px] leading-none">+</span>
      </span>
    </button>
  );
}
