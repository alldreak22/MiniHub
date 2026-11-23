export const VISUAL_THEME_STORAGE_KEY = "mini-hub:visual-theme";
export const DAILY_EDITION_OVERRIDE_KEY = "mini-hub:daily-edition-override";

export const GAME_PROGRESS_STORAGE_KEYS = {
  termo: "mini-hub:termo:v1",
  conexoes: "mini-hub:conexoes:v1",
  cronologia: "mini-hub:cronologia:v4",
} as const;

type RemovableStorage = Pick<Storage, "removeItem">;

export function clearGameProgress(storage: RemovableStorage) {
  Object.values(GAME_PROGRESS_STORAGE_KEYS).forEach((key) => storage.removeItem(key));
}

export function clearDailyEditionOverride(storage: RemovableStorage) {
  storage.removeItem(DAILY_EDITION_OVERRIDE_KEY);
}
