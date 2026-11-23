import { WORDS } from "./data/words";
import { dailyEditionFor, dayKey } from "../../../lib/dailyEdition";
import { GAME_PROGRESS_STORAGE_KEYS } from "../../../lib/storage";

export const STORAGE_KEY = GAME_PROGRESS_STORAGE_KEYS.termo;
// Incremente para invalidar partidas salvas. Mantenha a chave de armazenamento estável.
export const TERMO_STATE_VERSION = 2;
export const MAX_ATTEMPTS = 6;

export type LetterState = "correct" | "present" | "absent";
export type GameState = { version: number; day: string; editionKey: string; guesses: string[]; draft: string; selected: number };

export { dayKey };

export function answerFor(day: string) {
  return dailyEditionFor(day).termoAnswer;
}

export function evaluate(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("absent");
  const remaining: Record<string, number> = {};
  // Reserve exact matches before allocating the remaining occurrences.
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = "correct";
    else remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] !== "correct" && remaining[guess[i]] > 0) {
      result[i] = "present";
      remaining[guess[i]]--;
    }
  }
  return result;
}

export function isValidWord(word: string) {
  return WORDS.includes(word as (typeof WORDS)[number]);
}

export function isFinished(state: GameState) {
  return state.guesses.includes(answerFor(state.day)) || state.guesses.length === MAX_ATTEMPTS;
}

export function restore(raw: string | null, day: string): GameState {
  const editionKey = dailyEditionFor(day).key;
  const empty: GameState = { version: TERMO_STATE_VERSION, day, editionKey, guesses: [], draft: "", selected: 0 };
  try {
    const saved = JSON.parse(raw ?? "null");
    if (!saved || saved.version !== TERMO_STATE_VERSION || saved.day !== day || saved.editionKey !== editionKey || !Array.isArray(saved.guesses) ||
      saved.guesses.length > MAX_ATTEMPTS ||
      !saved.guesses.every((word: unknown) => typeof word === "string" && /^[A-Z]{5}$/.test(word)) ||
      typeof saved.draft !== "string" || !/^[A-Z ]{0,5}$/.test(saved.draft)) return empty;
    const win = saved.guesses.indexOf(answerFor(day));
    if (win !== -1 && win !== saved.guesses.length - 1) return empty;
    // Older saves have no selection; resume at the next sequential position.
    const selected = Number.isInteger(saved.selected) && saved.selected >= 0 && saved.selected < 5
      ? saved.selected : Math.min(saved.draft.length, 4);
    const state: GameState = { version: TERMO_STATE_VERSION, day, editionKey, guesses: saved.guesses, draft: saved.draft, selected };
    return isFinished(state) ? { ...state, draft: "", selected: 0 } : state;
  } catch {
    return empty;
  }
}

export function selectCell(state: GameState, selected: number): GameState {
  return !isFinished(state) && Number.isInteger(selected) && selected >= 0 && selected < 5
    ? { ...state, selected } : state;
}

export function enterKey(state: GameState, key: string): GameState {
  if (isFinished(state)) return state;
  if (key === "ArrowLeft" || key === "ArrowRight") {
    return selectCell(state, Math.max(0, Math.min(4, state.selected + (key === "ArrowRight" ? 1 : -1))));
  }
  if (key === "Backspace") {
    const cells = state.draft.padEnd(5, " ").split("");
    const selected = cells[state.selected] !== " " ? state.selected : Math.max(0, state.selected - 1);
    cells[selected] = " ";
    return { ...state, draft: cells.join("").trimEnd(), selected };
  }
  if (key === "Enter") {
    return /^[A-Z]{5}$/.test(state.draft)
      ? { ...state, guesses: [...state.guesses, state.draft], draft: "", selected: 0 }
      : state;
  }
  const letter = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  if (!/^[A-Z]$/.test(letter)) return state;
  const cells = state.draft.padEnd(5, " ").split("");
  cells[state.selected] = letter;
  return { ...state, draft: cells.join("").trimEnd(), selected: Math.min(state.selected + 1, 4) };
}
