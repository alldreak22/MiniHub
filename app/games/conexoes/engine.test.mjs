import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// Resolve os imports TypeScript sem extensão usados pelo Next.js, sem dependências.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
const { clearErrorSelection, createState, dayKey, moveWord, puzzleFor, remainingWords, restore, revealHint, shuffleWords, submitGroup, toggleWord, CONEXOES_STATE_VERSION, MAX_ERRORS, MAX_HINTS } = await import("./engine.ts");
const { PUZZLES } = await import("./data/puzzles.ts");
const day = "2026-09-22";
const empty = () => createState(day);
const groups = puzzleFor(day).groups;
const submit = (state, words) => submitGroup({ ...state, selected: [...words] });
const wrong = groups.map((group) => group.words[0]);

test("puzzles contain four groups of four unique words and daily selection is deterministic", () => {
  for (const puzzle of PUZZLES) {
    assert.equal(puzzle.groups.length, 4);
    for (const group of puzzle.groups) assert.equal(group.words.length, 4);
    assert.equal(new Set(puzzle.groups.flatMap((group) => group.words)).size, 16);
  }
  assert.equal(dayKey(new Date(2026, 8, 22, 12)), day);
  assert.deepEqual(empty(), empty());
  assert.equal(empty().order.length, 16);
  assert.notDeepEqual(empty().order, groups.flatMap((group) => group.words));
  for (let i = 1; i <= 30; i++) {
    const date = `2026-09-${String(i).padStart(2, "0")}`;
    assert.equal(puzzleFor(date), puzzleFor(date));
    assert.ok(PUZZLES.includes(puzzleFor(date)));
  }
});

test("selection toggles, caps at four after an error and rejects unknown words", () => {
  let state = empty();
  assert.equal(toggleWord(state, "INEXISTENTE"), state);
  for (const word of wrong) state = toggleWord(state, word);
  assert.equal(toggleWord(state, groups[1].words[1]), state);
  state = toggleWord(state, wrong[0]);
  assert.equal(state.selected.length, 3);
  assert.equal(submitGroup(state), state);
});

test("correct group in any order is found without consuming an error", () => {
  const before = empty();
  const state = submit(before, [...groups[0].words].reverse());
  assert.deepEqual(state.found, [0]);
  assert.deepEqual(state.selected, []);
  assert.equal(state.errors, 0);
  assert.equal(state.status, "playing");
  assert.deepEqual(state.order, before.order);
  assert.deepEqual(before.found, []);
});

test("incorrect group consumes one error and preserves words and selection during feedback", () => {
  const before = empty();
  const state = submit(before, wrong);
  assert.equal(state.errors, 1);
  assert.deepEqual(state.found, []);
  assert.deepEqual(state.selected, wrong);
  assert.deepEqual(state.order, before.order);
  assert.equal(state.status, "playing");
  assert.deepEqual(restore(JSON.stringify(state), day), state);
  const cleared = clearErrorSelection(state);
  assert.deepEqual(cleared.selected, []);
  assert.equal(cleared.errors, 1);
  assert.deepEqual(cleared.order, state.order);
});

test("the fourth selection automatically validates while earlier selections do not", () => {
  let state = empty();
  for (const word of groups[0].words.slice(0, 3)) state = toggleWord(state, word);
  assert.equal(state.selected.length, 3);
  assert.deepEqual(state.found, []);
  assert.equal(state.errors, 0);
  state = toggleWord(state, groups[0].words[3]);
  assert.deepEqual(state.found, [0]);
  assert.deepEqual(state.selected, []);
  let incorrect = empty();
  for (const word of wrong) incorrect = toggleWord(incorrect, word);
  assert.equal(incorrect.errors, 1);
  assert.deepEqual(incorrect.selected, wrong);
  incorrect = toggleWord(incorrect, wrong[0]);
  assert.equal(incorrect.errors, 1);
  assert.equal(incorrect.selected.length, 3);
  assert.equal(clearErrorSelection(incorrect), incorrect);
  incorrect = toggleWord(incorrect, groups[0].words[1]);
  assert.equal(incorrect.errors, 2);
});

test("four groups win, further actions are ignored and final state restores", () => {
  let state = submit(empty(), wrong);
  for (const group of groups) state = submit(state, group.words);
  assert.equal(state.status, "won");
  assert.equal(state.found.length, 4);
  assert.equal(state.errors, 1);
  assert.equal(toggleWord(state, wrong[0]), state);
  assert.equal(submitGroup(state), state);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("four errors lose, further actions are ignored and final state restores", () => {
  let state = empty();
  for (let i = 0; i < MAX_ERRORS; i++) state = submit(state, wrong);
  assert.equal(state.status, "lost");
  assert.equal(state.errors, MAX_ERRORS);
  assert.equal(toggleWord(state, wrong[0]), state);
  const attempted = { ...state, selected: groups[0].words };
  assert.equal(submitGroup(attempted), attempted);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("found groups cannot be selected or processed again", () => {
  const state = submit(empty(), groups[0].words);
  assert.equal(toggleWord(state, groups[0].words[0]), state);
  const repeated = { ...state, selected: groups[0].words };
  assert.equal(submitGroup(repeated), repeated);
  const duplicates = { ...empty(), selected: Array(4).fill(wrong[0]) };
  assert.equal(submitGroup(duplicates), duplicates);
});

test("restoration retains progress, selection and a saved permutation", () => {
  let state = submit(submit(empty(), wrong), groups[0].words);
  state = toggleWord(state, groups[1].words[0]);
  state = { ...state, order: [...state.order].reverse() };
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("incompatible versions, days and edited puzzles reset the save", () => {
  const state = submit(empty(), groups[0].words);
  for (const version of [undefined, null, "1", CONEXOES_STATE_VERSION - 1, CONEXOES_STATE_VERSION + 1]) {
    assert.deepEqual(restore(JSON.stringify({ ...state, version }), day), empty());
  }
  assert.deepEqual(restore(JSON.stringify(state), "2026-09-23"), createState("2026-09-23"));
  assert.deepEqual(restore(JSON.stringify({ ...state, puzzleId: "old-puzzle" }), day), empty());
});

test("malformed and inconsistent states are rejected", () => {
  for (const raw of ["{", "null", "[]", "42"]) assert.deepEqual(restore(raw, day), empty());
  for (const invalid of [
    { found: [0, 0] }, { found: [4] }, { found: [0.5] }, { found: ["0"] },
    { selected: ["INEXISTENTE"] }, { selected: [wrong[0], wrong[0]] },
    { found: [0], selected: [groups[0].words[0]] },
    { selected: empty().order.slice(0, 5) },
    { order: empty().order.slice(1) }, { order: Array(16).fill(wrong[0]) },
    { errors: -1 }, { errors: 5 }, { errors: 0.5 }, { status: "won" },
    { errors: 4, status: "playing" }, { found: [0, 1, 2, 3], status: "playing" },
    { found: [0, 1, 2, 3], errors: 4, status: "won" },
    { errors: 4, status: "lost", selected: [wrong[0]] },
  ]) assert.deepEqual(restore(JSON.stringify({ ...empty(), ...invalid }), day), empty());
});

test("hints reveal pairs from unresolved groups, prefer a different group and stop at two", () => {
  for (const random of [() => 0, () => 0.5, () => 0.999]) {
    let state = submit(empty(), groups[0].words);
    state = revealHint(state, random);
    state = revealHint(state, random);
    assert.equal(state.hints.length, MAX_HINTS);
    const hintedGroups = state.hints.map((hint) => {
      assert.equal(hint.words.length, 2);
      assert.equal(new Set(hint.words).size, 2);
      const index = groups.findIndex((group) => hint.words.every((word) => group.words.includes(word)));
      assert.ok(index > 0);
      return index;
    });
    assert.notEqual(hintedGroups[0], hintedGroups[1]);
    assert.notEqual(state.hints[0].marker, state.hints[1].marker);
    assert.equal(revealHint(state, random), state);
    assert.deepEqual(restore(JSON.stringify(state), day), state);
  }
});

test("two hints in the last unresolved group use different pairs and keep spent hints", () => {
  let state = empty();
  for (const group of groups.slice(0, 3)) state = submit(state, group.words);
  state = revealHint(revealHint(state, () => 0), () => 0);
  assert.equal(new Set(state.hints.flatMap((hint) => hint.words)).size, 4);
  assert.ok(state.hints.every((hint) => hint.words.every((word) => groups[3].words.includes(word))));
  state = submit(state, groups[3].words);
  assert.equal(state.hints.length, 2);
  assert.equal(revealHint(state), state);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("shuffle changes only remaining order and preserves resolved slots, selection, errors and hints", () => {
  let state = clearErrorSelection(submit(empty(), wrong));
  state = submit(submit(state, groups[2].words), groups[0].words);
  state = toggleWord(revealHint(state, () => 0), groups[1].words[0]);
  for (const random of [() => 0, () => 0.5, () => 0.999]) {
    const shuffled = shuffleWords(state, random);
    assert.deepEqual([...shuffled.order].sort(), [...state.order].sort());
    assert.deepEqual([...remainingWords(shuffled)].sort(), [...remainingWords(state)].sort());
    assert.notDeepEqual(remainingWords(shuffled), remainingWords(state));
    for (const group of [groups[0], groups[2]]) {
      for (const word of group.words) assert.equal(shuffled.order.indexOf(word), state.order.indexOf(word));
    }
    assert.deepEqual({ ...shuffled, order: state.order }, state);
    assert.deepEqual(restore(JSON.stringify(shuffled), day), shuffled);
  }
});

test("manual movement inserts at the target and changes only remaining order", () => {
  const state = revealHint(submit(empty(), groups[0].words), () => 0);
  const words = remainingWords(state);
  const moved = moveWord(state, words[0], words[3]);
  assert.deepEqual(remainingWords(moved).slice(0, 4), [words[1], words[2], words[3], words[0]]);
  assert.deepEqual({ ...moved, order: state.order }, state);
  assert.deepEqual(moveWord(moved, words[0], words[1]), state);
  assert.equal(moveWord(state, groups[0].words[0], words[0]), state);
  assert.equal(moveWord(state, words[0], groups[0].words[0]), state);
  assert.equal(moveWord(state, words[0], words[0]), state);
  assert.deepEqual(restore(JSON.stringify(moved), day), moved);
});

test("finished games reject hints and reordering, including during final error feedback", () => {
  let state = empty();
  for (let i = 0; i < MAX_ERRORS; i++) state = submit(state, wrong);
  assert.equal(revealHint(state), state);
  assert.equal(shuffleWords(state), state);
  assert.equal(moveWord(state, wrong[0], wrong[1]), state);
  assert.equal(clearErrorSelection(state).status, "lost");
  assert.deepEqual(restore(JSON.stringify(clearErrorSelection(state)), day), clearErrorSelection(state));
});

test("restoration rejects invalid hint pairs, markers and counts", () => {
  const valid = revealHint(empty(), () => 0).hints[0];
  for (const hints of [undefined, null, {}, [null], [valid, valid, valid],
    [{ ...valid, words: [wrong[0], wrong[1]] }],
    [{ ...valid, words: [wrong[0], wrong[0]] }],
    [{ ...valid, marker: "unknown" }], [valid, { ...valid, marker: "rose" }],
  ]) assert.deepEqual(restore(JSON.stringify({ ...empty(), hints }), day), empty());
});
