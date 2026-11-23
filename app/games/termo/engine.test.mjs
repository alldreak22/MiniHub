import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { answerFor, enterKey, evaluate, isFinished, isValidWord, restore, selectCell, TERMO_STATE_VERSION } = await import("./engine.ts");

const day = "2026-09-21";
const empty = () => restore(null, day);
const submit = (state, word) => enterKey({ ...state, draft: word }, "Enter");

test("arrows move only selection, stop at both edges and support typing after a click", () => {
  let state = { ...empty(), draft: "CARRO" };
  state = enterKey(state, "ArrowLeft");
  assert.equal(state.selected, 0);
  for (const expected of [1, 2, 3, 4, 4]) {
    state = enterKey(state, "ArrowRight");
    assert.equal(state.selected, expected);
    assert.equal(state.draft, "CARRO");
  }
  for (const expected of [3, 2, 1, 0, 0]) {
    state = enterKey(state, "ArrowLeft");
    assert.equal(state.selected, expected);
    assert.equal(state.draft, "CARRO");
  }
  state = enterKey(selectCell(state, 3), "ArrowLeft");
  state = enterKey(state, "N");
  assert.equal(state.draft, "CANRO");
  assert.equal(state.selected, 3);
  assert.deepEqual(state.guesses, []);
  const won = submit(empty(), answerFor(day));
  assert.equal(enterKey(won, "ArrowRight"), won);
  assert.equal(enterKey(won, "ArrowLeft"), won);
});

test("exact matches consume occurrences before misplaced repeated letters", () => {
  assert.deepEqual(evaluate("ARARA", "CARRO"), ["present", "present", "absent", "correct", "absent"]);
  assert.deepEqual(evaluate("AAAAA", "ARARA"), ["correct", "absent", "correct", "absent", "correct"]);
  assert.deepEqual(evaluate("RARAR", "ARARA"), ["present", "present", "present", "present", "absent"]);
});

test("input accepts five letters, normalizes accents and supports deletion", () => {
  let state = empty();
  for (const key of ["á", "b", "c", "d", "e", "1"]) state = enterKey(state, key);
  assert.equal(state.draft, "ABCDE");
  state = enterKey(state, "Backspace");
  assert.equal(state.draft, "ABCD");
  assert.equal(enterKey(state, "Enter"), state);
  assert.equal(state.guesses.length, 0);
});

test("six unsuccessful attempts end the game and block additional input", () => {
  let state = empty();
  const wrong = answerFor(day) === "LIVRO" ? "FESTA" : "LIVRO";
  for (let i = 0; i < 6; i++) state = submit(state, wrong);
  assert.equal(state.guesses.length, 6);
  assert.equal(isFinished(state), true);
  assert.equal(enterKey(state, "A"), state);
  assert.equal(enterKey(state, "Enter"), state);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("winning ends input and survives restoration", () => {
  const state = submit(empty(), answerFor(day));
  assert.equal(isFinished(state), true);
  assert.equal(enterKey(state, "Backspace"), state);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("restores draft and attempts, resets stale or malformed storage", () => {
  const validWrongWord = answerFor(day) === "LIVRO" ? "FESTA" : "LIVRO";
  const state = { ...submit(empty(), validWrongWord), draft: "PRA" };
  assert.deepEqual(restore(JSON.stringify(state), day), state);
  assert.deepEqual(restore(JSON.stringify(state), "2026-09-22"), { version: TERMO_STATE_VERSION, day: "2026-09-22", editionKey: "2026-09-22:videogames", guesses: [], draft: "", selected: 0 });
  for (const raw of ["{", "null", JSON.stringify({ ...state, guesses: [42] }), JSON.stringify({ ...state, guesses: Array(7).fill(validWrongWord) }), JSON.stringify({ ...state, guesses: [answerFor(day), validWrongWord] })]) {
    assert.deepEqual(restore(raw, day), empty());
  }
});

test("sequential typing advances selection and submission starts at the first cell", () => {
  let state = empty();
  for (const [index, letter] of [..."LIVRO"].entries()) {
    state = enterKey(state, letter);
    assert.equal(state.selected, Math.min(index + 1, 4));
  }
  state = enterKey(state, "Enter");
  assert.deepEqual(state.guesses, ["LIVRO"]);
  assert.equal(state.draft, "");
  assert.equal(state.selected, 0);
});

test("out-of-order input preserves holes and cannot submit an incomplete row", () => {
  let state = enterKey(selectCell(empty(), 4), "O");
  assert.equal(state.draft, "    O");
  assert.equal(enterKey(state, "Enter"), state);
  state = enterKey(selectCell(state, 2), "V");
  assert.equal(state.draft, "  V O");
  state = enterKey(selectCell(state, 0), "L");
  state = enterKey(state, "I");
  state = enterKey(selectCell(state, 3), "R");
  assert.equal(state.draft, "LIVRO");
  assert.deepEqual(enterKey(state, "Enter").guesses, ["LIVRO"]);
});

test("typing replaces an occupied cell and keeps selection at the last cell", () => {
  let state = { ...empty(), draft: "CARRO" };
  state = enterKey(selectCell(state, 2), "N");
  assert.equal(state.draft, "CANRO");
  assert.equal(state.selected, 3);
  state = enterKey(selectCell(state, 4), "A");
  assert.equal(state.draft, "CANRA");
  assert.equal(state.selected, 4);
});

test("Backspace clears the selected cell or moves back from an empty one without shifting letters", () => {
  let state = { ...empty(), draft: "CARRO", selected: 2 };
  state = enterKey(state, "Backspace");
  assert.equal(state.draft, "CA RO");
  assert.equal(state.selected, 2);
  state = enterKey(state, "Backspace");
  assert.equal(state.draft, "C  RO");
  assert.equal(state.selected, 1);
  state = enterKey(selectCell(state, 0), "Backspace");
  assert.equal(state.draft, "   RO");
  assert.equal(state.selected, 0);
  assert.deepEqual(enterKey(state, "Backspace"), state);
  let sequential = empty();
  for (const letter of "ABC") sequential = enterKey(sequential, letter);
  for (const expected of ["AB", "A", ""]) {
    sequential = enterKey(sequential, "Backspace");
    assert.equal(sequential.draft, expected);
    assert.equal(sequential.selected, expected.length);
  }
});

test("restores sparse drafts and rejects saves without an edition", () => {
  const state = enterKey(selectCell(empty(), 3), "A");
  assert.deepEqual(restore(JSON.stringify(state), day), state);
  const legacy = { version: TERMO_STATE_VERSION, day, guesses: [], draft: "LIV" };
  assert.deepEqual(restore(JSON.stringify(legacy), day), empty());
});

test("editing a new row preserves submitted guesses and finished games reject selection", () => {
  const validWrongWord = answerFor(day) === "LIVRO" ? "FESTA" : "LIVRO";
  const submitted = submit(empty(), validWrongWord);
  const edited = enterKey(selectCell(submitted, 4), "B");
  assert.deepEqual(edited.guesses, [validWrongWord]);
  const won = submit(empty(), answerFor(day));
  assert.equal(selectCell(won, 3), won);
  assert.equal(enterKey(won, "Z"), won);
});

test("persistence version is saved and only matching versions are restored", () => {
  const validWrongWord = answerFor(day) === "LIVRO" ? "FESTA" : "LIVRO";
  const state = { ...submit(empty(), validWrongWord), draft: "PRA" };
  assert.equal(JSON.parse(JSON.stringify(state)).version, TERMO_STATE_VERSION);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
  for (const version of [undefined, null, String(TERMO_STATE_VERSION), TERMO_STATE_VERSION - 1, TERMO_STATE_VERSION + 1]) {
    const restored = restore(JSON.stringify({ ...state, version }), day);
    assert.deepEqual(restored, empty());
    assert.equal(answerFor(restored.day), answerFor(state.day));
  }
});

test("word validation accepts only words from the game list", () => {
  assert.equal(isValidWord("LIVRO"), true);
  assert.equal(isValidWord("PEDRA"), true);

  assert.equal(isValidWord("AAAAA"), false);
  assert.equal(isValidWord("ABCDE"), false);
  assert.equal(isValidWord("ZZZZZ"), false);
});

test("daily answers are always valid game words", () => {
  for (const testDay of [
    "2026-09-21",
    "2026-09-22",
    "2026-10-01",
    "2027-01-01",
  ]) {
    assert.equal(isValidWord(answerFor(testDay)), true);
  }
});
