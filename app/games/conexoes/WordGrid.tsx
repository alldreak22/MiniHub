"use client";

import { useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { remainingWords, type GameState } from "./engine";

const markerColors = { cyan: "bg-conexoes-indigo", rose: "bg-conexoes-amber" };
type Drag = {
  word: string;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  active: boolean;
  target: string;
};

type Moving = Pick<Drag, "word" | "target" | "x" | "y" | "offsetX" | "offsetY" | "width" | "height">;

function previewOrder(words: string[], word: string, target: string) {
  if (word === target) return words;
  const next = [...words];
  const from = next.indexOf(word);
  const to = next.indexOf(target);
  if (from === -1 || to === -1) return words;
  next.splice(from, 1);
  next.splice(to, 0, word);
  return next;
}

export default function WordGrid({ state, feedback, hintWords, onSelect, onMove }: {
  state: GameState;
  feedback: boolean;
  hintWords: string[];
  onSelect: (word: string) => void;
  onMove: (word: string, target: string) => void;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const [moving, setMoving] = useState<Moving | null>(null);
  const words = remainingWords(state);
  const visibleWords = moving ? previewOrder(words, moving.word, moving.target) : words;

  function targetAt(clientX: number, clientY: number) {
    const container = grid.current;
    if (!container) return null;
    const bounds = container.getBoundingClientRect();
    if (clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return null;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-drop-word]"));
    let closest: { word: string; distance: number } | null = null;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const distance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
      const word = card.dataset.dropWord;
      if (word && (!closest || distance < closest.distance)) closest = { word, distance };
    }
    return closest?.word ?? null;
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    if (!current.active && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 8) return;
    current.active = true;
    suppressClick.current = true;
    current.x = event.clientX;
    current.y = event.clientY;
    const target = targetAt(event.clientX, event.clientY);
    if (target && target !== current.word) current.target = target;
    setMoving({
      word: current.word,
      target: current.target,
      x: current.x,
      y: current.y,
      offsetX: current.offsetX,
      offsetY: current.offsetY,
      width: current.width,
      height: current.height,
    });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    if (!cancelled && current.active && current.target !== current.word) onMove(current.word, current.target);
    suppressClick.current = current.active || cancelled;
    drag.current = null;
    setMoving(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div ref={grid} role="group" aria-label="Palavras disponíveis" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {words.map((word) => {
        const selected = state.selected.includes(word);
        const hint = state.hints.find((item) => item.words.includes(word));
        const isMoving = moving?.word === word;
        return (
          <div
            key={word}
            className="min-w-0"
            style={{ order: visibleWords.indexOf(word) }}
          >
            <button
              type="button"
              tabIndex={-1}
              data-drop-word={word}
              aria-pressed={selected}
              aria-label={hint ? `${word}, marca ${hint.marker === "cyan" ? "índigo" : "âmbar"}` : word}
              disabled={state.status !== "playing" || (feedback && !selected)}
              onPointerDown={(event) => {
                if (event.button !== 0 || !event.isPrimary) return;
                suppressClick.current = false;
                if (feedback) return;
                const rect = event.currentTarget.getBoundingClientRect();
                drag.current = {
                  word,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  x: event.clientX,
                  y: event.clientY,
                  offsetX: event.clientX - rect.left,
                  offsetY: event.clientY - rect.top,
                  width: rect.width,
                  height: rect.height,
                  active: false,
                  target: word,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={pointerMove}
              onPointerUp={(event) => endDrag(event)}
              onPointerCancel={(event) => endDrag(event, true)}
              onLostPointerCapture={(event) => endDrag(event, true)}
              onClick={(event) => { if (event.detail > 0 && !suppressClick.current) onSelect(word); }}
              className={`relative min-h-16 w-full min-w-0 touch-none select-none overflow-hidden wrap-anywhere rounded-card border px-2 py-3 text-xs font-bold transition-[opacity,border-color,background-color,box-shadow] motion-reduce:transition-none sm:min-h-20 sm:text-sm ${selected ? "border-primary bg-primary text-on-primary shadow-tactile-pressed" : "border-border-strong bg-surface text-text-primary shadow-tactile enabled:hover:border-text-muted"} ${(feedback && selected) || hintWords.includes(word) ? "conexoes-shake" : ""} ${isMoving ? "cursor-grabbing border-dashed border-conexoes-indigo bg-conexoes-indigo-subtle text-transparent opacity-40 shadow-none" : "cursor-grab"}`}
            >
              {hint && <span aria-hidden="true" className={`pointer-events-none absolute top-0 right-0 size-5 [clip-path:polygon(0_0,100%_0,100%_100%)] ${markerColors[hint.marker]}`} />}
              {word}
            </button>
          </div>
        );
      })}
      {moving && createPortal(
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed z-50 flex scale-[1.03] items-center justify-center overflow-hidden wrap-anywhere rounded-card border px-2 py-3 text-center text-xs font-bold shadow-overlay motion-reduce:scale-100 sm:text-sm ${state.selected.includes(moving.word) ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-surface text-text-primary"}`}
          style={{
            left: moving.x - moving.offsetX,
            top: moving.y - moving.offsetY,
            width: moving.width,
            height: moving.height,
          }}
        >
          {state.hints.find((item) => item.words.includes(moving.word)) && (
            <span aria-hidden="true" className={`pointer-events-none absolute top-0 right-0 size-5 [clip-path:polygon(0_0,100%_0,100%_100%)] ${markerColors[state.hints.find((item) => item.words.includes(moving.word))!.marker]}`} />
          )}
          {moving.word}
        </div>,
        document.body,
      )}
    </div>
  );
}
