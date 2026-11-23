import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { dailyEditionFor, conexoesPuzzleForEdition, cronologiaPuzzleForEdition, nextDailyEditionId, changeDailyEdition } = await import("./dailyEdition.ts");
const { clearGameProgress, DAILY_EDITION_OVERRIDE_KEY, VISUAL_THEME_STORAGE_KEY } = await import("./storage.ts");

test("a mesma data produz a mesma edição e referências válidas", () => {
  const day = "2026-10-08";
  assert.deepEqual(dailyEditionFor(day), dailyEditionFor(day));
  assert.equal(conexoesPuzzleForEdition(day).id, dailyEditionFor(day).conexoesPuzzleId);
  assert.equal(cronologiaPuzzleForEdition(day).id, dailyEditionFor(day).cronologiaPuzzleId);
  assert.ok(dailyEditionFor(day).theme.length > 0);
  assert.equal(dailyEditionFor(day).termoAnswer.length, 5);
});

test("redefinir progresso preserva a preferência de tema visual", () => {
  const values = new Map([
    [VISUAL_THEME_STORAGE_KEY, "dark"],
    ["mini-hub:termo:v1", "termo"],
    ["mini-hub:conexoes:v1", "conexoes"],
    ["mini-hub:cronologia:v4", "cronologia"],
  ]);
  clearGameProgress({ removeItem: (key) => values.delete(key) });
  assert.equal(values.get(VISUAL_THEME_STORAGE_KEY), "dark");
  assert.equal(values.size, 1);
});

test("override de debug percorre as edições disponíveis em ciclo", () => {
  const day = "2026-10-08";
  const first = dailyEditionFor(day).id;
  const second = nextDailyEditionId(day, null);
  const third = nextDailyEditionId(day, second);
  const fourth = nextDailyEditionId(day, third);
  assert.notEqual(second, first);
  assert.notEqual(third, second);
  assert.equal(fourth, first);
  assert.equal(dailyEditionFor(day, second).id, second);
});

test("trocar edição altera o pacote de conteúdo e limpa os saves sem afetar o tema visual", () => {
  const day = "2026-10-08";
  const natural = dailyEditionFor(day);
  const values = new Map([
    [VISUAL_THEME_STORAGE_KEY, "dark"],
    ["mini-hub:termo:v1", "termo"],
    ["mini-hub:conexoes:v1", "conexoes"],
    ["mini-hub:cronologia:v4", "cronologia"],
  ]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const next = changeDailyEdition(storage, day);
  const changed = dailyEditionFor(day, next);
  assert.notEqual(changed.id, natural.id);
  assert.notEqual(changed.termoAnswer, natural.termoAnswer);
  assert.notEqual(conexoesPuzzleForEdition(day).id, dailyEditionFor(day, next).conexoesPuzzleId);
  assert.notEqual(natural.cronologiaPuzzleId, changed.cronologiaPuzzleId);
  assert.equal(values.get(DAILY_EDITION_OVERRIDE_KEY), next);
  assert.equal(values.get(VISUAL_THEME_STORAGE_KEY), "dark");
  assert.equal(values.has("mini-hub:termo:v1"), false);
  assert.equal(values.has("mini-hub:conexoes:v1"), false);
  assert.equal(values.has("mini-hub:cronologia:v4"), false);
});
