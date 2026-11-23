import { conexoesPuzzleForEdition, dailyEditionFor, dayKey } from "../../../lib/dailyEdition";
import { GAME_PROGRESS_STORAGE_KEYS } from "../../../lib/storage";

export const STORAGE_KEY = GAME_PROGRESS_STORAGE_KEYS.conexoes;
export const CONEXOES_STATE_VERSION = 3;
export const MAX_ERRORS = 4;
export const MAX_HINTS = 2;
export const HINT_MARKERS = ["cyan", "rose"] as const;
export type Hint = { words: [string, string]; marker: (typeof HINT_MARKERS)[number] };
export type GameState = {
  version: number;
  day: string;
  editionKey: string;
  puzzleId: string;
  found: number[];
  selected: string[];
  order: string[];
  errors: number;
  hints: Hint[];
  status: "playing" | "won" | "lost";
};

export { dayKey };

export function puzzleFor(day: string) {
  return conexoesPuzzleForEdition(day);
}

export function createState(day: string): GameState {
  const editionKey = dailyEditionFor(day).key;
  const puzzle = puzzleFor(day);
  const order = puzzle.groups.flatMap((group) => group.words);
  // Fisher–Yates com semente diária: a ordem não depende de renderizações.
  let seed = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000) >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((seed / 4294967296) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { version: CONEXOES_STATE_VERSION, day, editionKey, puzzleId: puzzle.id, found: [], selected: [], order, errors: 0, hints: [], status: "playing" };
}

function availableWords(state: GameState) {
  return puzzleFor(state.day).groups.flatMap((group, index) => state.found.includes(index) ? [] : group.words);
}

export function remainingWords(state: GameState) {
  const available = availableWords(state);
  return state.order.filter((word) => available.includes(word));
}

export function toggleWord(state: GameState, word: string): GameState {
  if (state.status !== "playing" || !availableWords(state).includes(word)) return state;
  if (state.selected.includes(word)) return { ...state, selected: state.selected.filter((item) => item !== word) };
  if (state.selected.length === 4) return state;
  const next = { ...state, selected: [...state.selected, word] };
  return next.selected.length === 4 ? submitGroup(next) : next;
}

export function submitGroup(state: GameState): GameState {
  if (state.status !== "playing" || state.selected.length !== 4 || new Set(state.selected).size !== 4 ||
    !state.selected.every((word) => availableWords(state).includes(word))) return state;
  const index = puzzleFor(state.day).groups.findIndex((group) => state.selected.every((word) => group.words.includes(word)));
  if (index !== -1) {
    const found = [...state.found, index];
    return { ...state, found, selected: [], status: found.length === 4 ? "won" : "playing" };
  }
  const errors = state.errors + 1;
  return { ...state, errors, status: errors === MAX_ERRORS ? "lost" : "playing" };
}

export function clearErrorSelection(state: GameState): GameState {
  return state.selected.length === 4 ? { ...state, selected: [] } : state;
}

export function revealHint(state: GameState, random = Math.random): GameState {
  if (state.status !== "playing" || state.hints.length >= MAX_HINTS) return state;
  const revealed = state.hints.flatMap((hint) => hint.words);
  const groups = puzzleFor(state.day).groups.filter((_, index) => !state.found.includes(index));
  const freshGroups = groups.filter((group) => !group.words.some((word) => revealed.includes(word)));
  const candidates = freshGroups.length ? freshGroups : groups;
  const group = candidates[Math.floor(random() * candidates.length)];
  if (!group) return state;
  const words = group.words.filter((word) => !revealed.includes(word));
  const first = words.splice(Math.floor(random() * words.length), 1)[0];
  const second = words[Math.floor(random() * words.length)];
  if (!first || !second) return state;
  const hint: Hint = { words: [first, second], marker: HINT_MARKERS[state.hints.length] };
  return { ...state, hints: [...state.hints, hint] };
}

function replaceRemainingOrder(state: GameState, words: string[]): GameState {
  const available = new Set(words);
  let index = 0;
  return { ...state, order: state.order.map((word) => available.has(word) ? words[index++] : word) };
}

export function shuffleWords(state: GameState, random = Math.random): GameState {
  if (state.status !== "playing") return state;
  const before = remainingWords(state);
  const words = [...before];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  if (words.every((word, index) => word === before[index])) words.push(words.shift()!);
  return replaceRemainingOrder(state, words);
}

export function moveWord(state: GameState, word: string, target: string): GameState {
  if (state.status !== "playing" || word === target) return state;
  const words = remainingWords(state);
  const from = words.indexOf(word);
  const to = words.indexOf(target);
  if (from === -1 || to === -1) return state;
  words.splice(from, 1);
  words.splice(to, 0, word);
  return replaceRemainingOrder(state, words);
}

export function restore(raw: string | null, day: string): GameState {
  const empty = createState(day);
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (!saved || typeof saved !== "object") return empty;
    const value = saved as Record<string, unknown>;
    const { found, selected, order, errors, status, hints } = value;
    if (value.version !== CONEXOES_STATE_VERSION || value.day !== day || value.editionKey !== empty.editionKey || value.puzzleId !== empty.puzzleId ||
      !Array.isArray(found) || found.length > 4 || !found.every((index: unknown) => typeof index === "number" && Number.isInteger(index) && index >= 0 && index < 4) || new Set(found).size !== found.length ||
      !Array.isArray(selected) || selected.length > 4 || !selected.every((word: unknown) => typeof word === "string") || new Set(selected).size !== selected.length ||
      !Array.isArray(order) || order.length !== 16 || new Set(order).size !== 16 || !order.every((word: unknown) => typeof word === "string" && empty.order.includes(word)) ||
      typeof errors !== "number" || !Number.isInteger(errors) || errors < 0 || errors > MAX_ERRORS ||
      (found.length === 4 && errors === MAX_ERRORS)) return empty;
    const expectedStatus = found.length === 4 ? "won" : errors === MAX_ERRORS ? "lost" : "playing";
    if (status !== expectedStatus || (status === "won" && selected.length > 0) ||
      (status === "lost" && selected.length !== 0 && selected.length !== 4)) return empty;
    if (selected.length === 4 && (errors === 0 || puzzleFor(day).groups.some((group) => selected.every((word) => group.words.includes(word))))) return empty;
    if (!Array.isArray(hints) || hints.length > MAX_HINTS) return empty;
    const restoredHints: Hint[] = [];
    for (const [index, entry] of hints.entries()) {
      if (!entry || typeof entry !== "object") return empty;
      const hint = entry as Record<string, unknown>;
      if (hint.marker !== HINT_MARKERS[index] || !Array.isArray(hint.words) || hint.words.length !== 2) return empty;
      const [first, second]: unknown[] = hint.words;
      if (typeof first !== "string" || typeof second !== "string" || first === second ||
        !puzzleFor(day).groups.some((group) => group.words.includes(first) && group.words.includes(second)) ||
        restoredHints.some((previous) => previous.words.includes(first) || previous.words.includes(second))) return empty;
      restoredHints.push({ words: [first, second], marker: HINT_MARKERS[index] });
    }
    const state: GameState = { ...empty, found, selected, order, errors, hints: restoredHints, status: expectedStatus };
    return selected.every((word) => availableWords(state).includes(word)) ? state : empty;
  } catch {
    return empty;
  }
}
