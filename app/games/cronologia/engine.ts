import type { TimelineEvent } from "./data/puzzles";
import { cronologiaPuzzleForEdition, dailyEditionFor, dayKey } from "../../../lib/dailyEdition";
import { GAME_PROGRESS_STORAGE_KEYS } from "../../../lib/storage";

export const STORAGE_KEY = GAME_PROGRESS_STORAGE_KEYS.cronologia;
export const CRONOLOGIA_STATE_VERSION = 5;
export const MAX_ERRORS = 3;
export const TOTAL_EVENTS = 11;
export const INITIAL_EVENTS = 1;

export type GameStatus = "playing" | "won" | "lost";
export type PlacementOutcome = "correct" | "incorrect";

export type GameState = {
  version: number;
  day: string;
  editionKey: string;
  puzzleId: string;
  presentationOrder: string[];
  timeline: string[];
  attemptedEventIds: string[];
  placementOutcomes: Record<string, PlacementOutcome>;
  currentEventId: string | null;
  errors: number;
  correct: number;
  yearsRevealed: boolean;
  status: GameStatus;
};

export type PlacementResult = {
  state: GameState;
  correct: boolean;
  correctIndex: number;
  eventId: string;
};

export { dayKey };

export function puzzleFor(day: string) {
  return cronologiaPuzzleForEdition(day);
}

function eventOrder(first: TimelineEvent, second: TimelineEvent) {
  return first.year - second.year || first.id.localeCompare(second.id);
}

export function sortEvents(events: TimelineEvent[]) {
  return [...events].sort(eventOrder);
}

export function correctPosition(event: TimelineEvent, timeline: TimelineEvent[]) {
  return timeline.filter((item) => eventOrder(item, event) < 0).length;
}

export function validatePlacement(event: TimelineEvent, timeline: TimelineEvent[], index: number) {
  return Number.isInteger(index) && index >= 0 && index <= timeline.length && index === correctPosition(event, timeline);
}

export function insertCorrectly(event: TimelineEvent, timeline: TimelineEvent[]) {
  const next = [...timeline];
  next.splice(correctPosition(event, timeline), 0, event);
  return next;
}

function shuffled(ids: string[], day: string) {
  const result = [...ids];
  let seed = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000) >>> 0;
  for (let index = result.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const target = Math.floor((seed / 4294967296) * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createState(day: string): GameState {
  const editionKey = dailyEditionFor(day).key;
  const puzzle = puzzleFor(day);
  const timeline = [puzzle.initialEventId];
  const presentationOrder = shuffled(puzzle.events.filter((event) => event.id !== puzzle.initialEventId).map((event) => event.id), day);
  return {
    version: CRONOLOGIA_STATE_VERSION,
    day,
    editionKey,
    puzzleId: puzzle.id,
    presentationOrder,
    timeline,
    attemptedEventIds: [],
    placementOutcomes: {},
    currentEventId: presentationOrder[0] ?? null,
    errors: 0,
    correct: 0,
    yearsRevealed: false,
    status: "playing",
  };
}

export function placeCurrent(state: GameState, insertionIndex: number): PlacementResult | null {
  if (state.status !== "playing" || !state.currentEventId) return null;
  const puzzle = puzzleFor(state.day);
  const byId = new Map(puzzle.events.map((event) => [event.id, event]));
  const event = byId.get(state.currentEventId);
  const timelineEvents = state.timeline.map((id) => byId.get(id)).filter((item): item is TimelineEvent => Boolean(item));
  if (!event || timelineEvents.length !== state.timeline.length || !Number.isInteger(insertionIndex) || insertionIndex < 0 || insertionIndex > timelineEvents.length) return null;

  const correctIndex = correctPosition(event, timelineEvents);
  const isCorrect = validatePlacement(event, timelineEvents, insertionIndex);
  const timeline = insertCorrectly(event, timelineEvents).map((item) => item.id);
  const attemptedEventIds = [...state.attemptedEventIds, event.id];
  const placementOutcomes: Record<string, PlacementOutcome> = {
    ...state.placementOutcomes,
    [event.id]: isCorrect ? "correct" : "incorrect",
  };
  const errors = state.errors + (isCorrect ? 0 : 1);
  const correct = state.correct + (isCorrect ? 1 : 0);
  const lost = errors >= MAX_ERRORS;
  const won = timeline.length === puzzle.events.length;
  const status: GameStatus = lost ? "lost" : won ? "won" : "playing";
  const currentEventId = status === "playing" ? state.presentationOrder[attemptedEventIds.length] ?? null : null;

  return {
    correct: isCorrect,
    correctIndex,
    eventId: event.id,
    state: { ...state, timeline, attemptedEventIds, placementOutcomes, currentEventId, errors, correct, yearsRevealed: true, status },
  };
}

export function solveState(day: string) {
  const state = createState(day);
  const puzzle = puzzleFor(day);
  return {
    ...state,
    timeline: sortEvents(puzzle.events).map((event) => event.id),
    attemptedEventIds: [...state.presentationOrder],
    placementOutcomes: Object.fromEntries(state.presentationOrder.map((id) => [id, "correct"])) as Record<string, PlacementOutcome>,
    currentEventId: null,
    correct: state.presentationOrder.length,
    yearsRevealed: true,
    status: "won" as const,
  };
}

export function restore(raw: string | null, day: string): GameState {
  const empty = createState(day);
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (!saved || typeof saved !== "object") return empty;
    const value = saved as Record<string, unknown>;
    const puzzle = puzzleFor(day);
    const allIds = puzzle.events.map((event) => event.id);
    const initialIds = empty.timeline;
    const remainingIds = empty.presentationOrder;
    const { presentationOrder, timeline, attemptedEventIds, placementOutcomes, currentEventId, errors, correct, yearsRevealed, status } = value;
    if (value.version !== CRONOLOGIA_STATE_VERSION || value.day !== day || value.editionKey !== empty.editionKey || value.puzzleId !== empty.puzzleId ||
      !Array.isArray(presentationOrder) || presentationOrder.length !== remainingIds.length || new Set(presentationOrder).size !== remainingIds.length || !presentationOrder.every((id: unknown) => typeof id === "string" && remainingIds.includes(id)) ||
      !Array.isArray(timeline) || timeline.length < INITIAL_EVENTS || timeline.length > allIds.length || new Set(timeline).size !== timeline.length || !timeline.every((id: unknown) => typeof id === "string" && allIds.includes(id)) ||
      !Array.isArray(attemptedEventIds) || attemptedEventIds.length > remainingIds.length || !attemptedEventIds.every((id: unknown, index) => id === presentationOrder[index]) ||
      !placementOutcomes || typeof placementOutcomes !== "object" || Array.isArray(placementOutcomes) ||
      (currentEventId !== null && typeof currentEventId !== "string") ||
      typeof errors !== "number" || !Number.isInteger(errors) || errors < 0 || errors > MAX_ERRORS ||
      typeof correct !== "number" || !Number.isInteger(correct) || correct < 0 || correct > attemptedEventIds.length || correct + errors !== attemptedEventIds.length ||
      typeof yearsRevealed !== "boolean" || !["playing", "won", "lost"].includes(String(status))) return empty;

    const outcomes = placementOutcomes as Record<string, unknown>;
    const outcomeIds = Object.keys(outcomes);
    const expectedOutcomeIds = attemptedEventIds;
    if (outcomeIds.length !== expectedOutcomeIds.length ||
      !expectedOutcomeIds.every((id) => outcomes[id] === "correct" || outcomes[id] === "incorrect") ||
      outcomeIds.some((id) => !expectedOutcomeIds.includes(id)) ||
      attemptedEventIds.filter((id) => outcomes[id] === "correct").length !== correct ||
      attemptedEventIds.filter((id) => outcomes[id] === "incorrect").length !== errors) return empty;

    const timelineEvents = (timeline as string[]).map((id) => puzzle.events.find((event) => event.id === id)!);
    const expectedStatus: GameStatus = errors === MAX_ERRORS ? "lost" : attemptedEventIds.length === remainingIds.length ? "won" : "playing";
    const expectedCurrent = expectedStatus === "playing" ? presentationOrder[attemptedEventIds.length] : null;
    const expectedTimelineLength = INITIAL_EVENTS + attemptedEventIds.length;
    if (status !== expectedStatus || currentEventId !== expectedCurrent || timeline.length !== expectedTimelineLength ||
      !initialIds.every((id) => timeline.includes(id)) || !attemptedEventIds.every((id) => timeline.includes(id)) ||
      sortEvents(timelineEvents).some((event, index) => event.id !== timeline[index]) ||
      yearsRevealed !== (attemptedEventIds.length > 0)) return empty;

    return value as GameState;
  } catch {
    return empty;
  }
}
