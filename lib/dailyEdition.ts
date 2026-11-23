import { WORDS } from "../app/games/termo/data/words";
import { PUZZLES as CONEXOES_PUZZLES } from "../app/games/conexoes/data/puzzles";
import { PUZZLES as CRONOLOGIA_PUZZLES } from "../app/games/cronologia/data/puzzles";
import { DAILY_EDITION_OVERRIDE_KEY, clearGameProgress } from "./storage";

export const DAILY_EDITION_CHANGE_EVENT = "mini-hub:daily-edition-change";

const EDITIONS = [
  {
    id: "videogames",
    theme: "História dos videogames",
    conexoesPuzzleId: "cotidiano-1",
    cronologiaPuzzleId: "videogames-2",
  },
  {
    id: "brasil",
    theme: "História do Brasil",
    conexoesPuzzleId: "lazer-1",
    cronologiaPuzzleId: "brasil-2",
  },
  {
    id: "espaco",
    theme: "Exploração espacial",
    conexoesPuzzleId: "natureza-1",
    cronologiaPuzzleId: "espaco-2",
  },
] as const;

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dailyIndex(day: string, length: number) {
  const index = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
  return ((index % length) + length) % length;
}

function storedOverride() {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DAILY_EDITION_OVERRIDE_KEY);
  } catch {
    return null;
  }
}

export function dailyEditionFor(day: string, overrideId: string | null = storedOverride()) {
  const naturalIndex = dailyIndex(day, EDITIONS.length);
  const naturalEdition = EDITIONS[naturalIndex];
  const edition = EDITIONS.find((item) => item.id === overrideId) ?? naturalEdition;
  const editionIndex = EDITIONS.findIndex((item) => item.id === edition.id);
  const termoIndex = (dailyIndex(day, WORDS.length) + editionIndex - naturalIndex + WORDS.length) % WORDS.length;
  return {
    day,
    key: `${day}:${edition.id}`,
    ...edition,
    termoAnswer: WORDS[termoIndex],
  };
}

export function nextDailyEditionId(day: string, overrideId: string | null) {
  const current = dailyEditionFor(day, overrideId);
  const index = EDITIONS.findIndex((edition) => edition.id === current.id);
  return EDITIONS[(index + 1) % EDITIONS.length].id;
}

type DailyEditionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function changeDailyEdition(storage: DailyEditionStorage, day: string) {
  const nextEdition = nextDailyEditionId(day, storage.getItem(DAILY_EDITION_OVERRIDE_KEY));
  clearGameProgress(storage);
  storage.setItem(DAILY_EDITION_OVERRIDE_KEY, nextEdition);
  return nextEdition;
}

export function conexoesPuzzleForEdition(day: string) {
  const { conexoesPuzzleId } = dailyEditionFor(day);
  const puzzle = CONEXOES_PUZZLES.find((item) => item.id === conexoesPuzzleId);
  if (!puzzle) throw new Error(`Puzzle de Conexões não encontrado: ${conexoesPuzzleId}`);
  return puzzle;
}

export function cronologiaPuzzleForEdition(day: string) {
  const { cronologiaPuzzleId } = dailyEditionFor(day);
  const puzzle = CRONOLOGIA_PUZZLES.find((item) => item.id === cronologiaPuzzleId);
  if (!puzzle) throw new Error(`Puzzle de Cronologia não encontrado: ${cronologiaPuzzleId}`);
  return puzzle;
}
