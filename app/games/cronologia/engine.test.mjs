import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { CRONOLOGIA_STATE_VERSION, INITIAL_EVENTS, MAX_ERRORS, TOTAL_EVENTS, correctPosition, createState, insertCorrectly, placeCurrent, puzzleFor, restore, solveState, sortEvents, validatePlacement } = await import("./engine.ts");
const { PUZZLES } = await import("./data/puzzles.ts");
const day = "2026-09-23";
const event = (id, year) => ({ id, title: id, year });

test("posição correta funciona no início, entre eventos e no final", () => {
  const timeline = [event("b", 1950), event("d", 2000)];
  assert.equal(correctPosition(event("a", 1900), timeline), 0);
  assert.equal(correctPosition(event("c", 1975), timeline), 1);
  assert.equal(correctPosition(event("e", 2020), timeline), 2);
  assert.equal(validatePlacement(event("c", 1975), timeline, 1), true);
  assert.equal(validatePlacement(event("c", 1975), timeline, 0), false);
  assert.deepEqual(insertCorrectly(event("c", 1975), timeline).map((item) => item.id), ["b", "c", "d"]);
});

test("puzzles têm tema, onze eventos únicos e uma referência válida", () => {
  for (const puzzle of PUZZLES) {
    assert.ok(puzzle.theme.length > 0);
    assert.equal(puzzle.events.length, 11);
    assert.equal(new Set(puzzle.events.map((item) => item.id)).size, 11);
    assert.equal(new Set(puzzle.events.map((item) => item.year)).size, 11);
    assert.ok(puzzle.events.some((item) => item.id === puzzle.initialEventId));
  }
  assert.equal(puzzleFor(day), puzzleFor(day));
  assert.deepEqual(createState(day), createState(day));
  assert.equal(createState(day).timeline.length, 1);
  assert.equal(createState(day).presentationOrder.length, 10);
  assert.equal(createState(day).attemptedEventIds.length, 0);
  assert.equal(createState(day).correct, 0);
  assert.equal(createState(day).yearsRevealed, false);
  assert.equal(createState(day).placementOutcomes[puzzleFor(day).initialEventId], undefined);
});

test("primeira tentativa correta insere, revela anos e avança", () => {
  const before = createState(day);
  const puzzle = puzzleFor(day);
  const current = puzzle.events.find((item) => item.id === before.currentEventId);
  const timeline = before.timeline.map((id) => puzzle.events.find((item) => item.id === id));
  const result = placeCurrent(before, correctPosition(current, timeline));
  assert.equal(result.correct, true);
  assert.equal(result.state.correct, 1);
  assert.equal(result.state.errors, 0);
  assert.equal(result.state.yearsRevealed, true);
  assert.equal(result.state.timeline.length, 2);
  assert.equal(result.state.placementOutcomes[current.id], "correct");
  assert.equal(result.state.currentEventId, before.presentationOrder[1]);
});

test("tentativa incorreta registra o resultado e insere na posição certa", () => {
  const before = createState(day);
  const puzzle = puzzleFor(day);
  const current = puzzle.events.find((item) => item.id === before.currentEventId);
  const timeline = before.timeline.map((id) => puzzle.events.find((item) => item.id === id));
  const position = correctPosition(current, timeline);
  const wrongPosition = position === 0 ? 1 : 0;
  const result = placeCurrent(before, wrongPosition);
  assert.equal(result.correct, false);
  assert.equal(result.state.errors, 1);
  assert.equal(result.state.correct, 0);
  assert.equal(result.state.placementOutcomes[current.id], "incorrect");
  assert.equal(result.state.timeline[result.correctIndex], current.id);
  assert.deepEqual(result.state.timeline, sortEvents(result.state.timeline.map((id) => puzzle.events.find((item) => item.id === id))).map((item) => item.id));
  assert.equal(result.state.placementOutcomes[current.id], "incorrect");
});

test("três erros encerram com apenas os eventos realmente jogados", () => {
  let state = createState(day);
  for (let count = 0; count < 2; count++) {
    const puzzle = puzzleFor(day);
    const current = puzzle.events.find((item) => item.id === state.currentEventId);
    const timeline = state.timeline.map((id) => puzzle.events.find((item) => item.id === id));
    state = placeCurrent(state, correctPosition(current, timeline)).state;
  }
  for (let count = 0; count < MAX_ERRORS; count++) {
    const result = placeCurrent(state, -1);
    assert.equal(result, null);
    const puzzle = puzzleFor(day);
    const current = puzzle.events.find((item) => item.id === state.currentEventId);
    const timeline = state.timeline.map((id) => puzzle.events.find((item) => item.id === id));
    const correct = correctPosition(current, timeline);
    state = placeCurrent(state, correct === 0 ? 1 : 0).state;
  }
  assert.equal(state.errors, MAX_ERRORS);
  assert.equal(state.status, "lost");
  assert.equal(state.correct, 2);
  assert.equal(state.attemptedEventIds.length, 5);
  assert.equal(state.timeline.length, INITIAL_EVENTS + state.attemptedEventIds.length);
  assert.equal(Object.keys(state.placementOutcomes).length, state.attemptedEventIds.length);
  assert.equal(state.placementOutcomes[puzzleFor(day).initialEventId], undefined);
  assert.equal(state.attemptedEventIds.filter((id) => state.placementOutcomes[id] === "incorrect").length, 3);
  assert.equal(state.presentationOrder.filter((id) => !state.attemptedEventIds.includes(id)).every((id) => !state.timeline.includes(id) && state.placementOutcomes[id] === undefined), true);
  assert.equal(TOTAL_EVENTS - INITIAL_EVENTS, 10);
  assert.equal(state.currentEventId, null);
  assert.equal(placeCurrent(state, 0), null);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("dez posicionamentos concluem a partida com onze eventos", () => {
  let state = createState(day);
  while (state.status === "playing") {
    const puzzle = puzzleFor(day);
    const current = puzzle.events.find((item) => item.id === state.currentEventId);
    const timeline = state.timeline.map((id) => puzzle.events.find((item) => item.id === id));
    state = placeCurrent(state, correctPosition(current, timeline)).state;
  }
  assert.equal(state.status, "won");
  assert.equal(state.correct, 10);
  assert.equal(state.attemptedEventIds.length, 10);
  assert.equal(state.timeline.length, 11);
  assert.deepEqual(restore(JSON.stringify(state), day), state);
});

test("restore preserva os resultados individuais dos eventos", () => {
  const initial = createState(day);
  const puzzle = puzzleFor(day);
  const current = puzzle.events.find((item) => item.id === initial.currentEventId);
  const timeline = initial.timeline.map((id) => puzzle.events.find((item) => item.id === id));
  const progress = placeCurrent(initial, correctPosition(current, timeline)).state;
  const nextCurrent = puzzle.events.find((item) => item.id === progress.currentEventId);
  const nextTimeline = progress.timeline.map((id) => puzzle.events.find((item) => item.id === id));
  const nextCorrectPosition = correctPosition(nextCurrent, nextTimeline);
  const mixedProgress = placeCurrent(progress, nextCorrectPosition === 0 ? 1 : 0).state;
  const restored = restore(JSON.stringify(mixedProgress), day);
  assert.deepEqual(restored, mixedProgress);
  assert.equal(restored.placementOutcomes[current.id], "correct");
  assert.equal(restored.placementOutcomes[nextCurrent.id], "incorrect");
  assert.equal(restored.placementOutcomes[puzzle.initialEventId], undefined);
  const solved = solveState(day);
  assert.deepEqual(restore(JSON.stringify(solved), day), solved);
});

test("restauração rejeita versão, dia e estados inconsistentes", () => {
  const state = createState(day);
  for (const invalid of [
    { version: CRONOLOGIA_STATE_VERSION + 1 },
    { timeline: [...state.timeline].reverse() },
    { currentEventId: "inexistente" },
    { errors: 1 },
    { correct: 1 },
    { placementOutcomes: { inexistente: "correct" } },
    { yearsRevealed: true },
    { status: "won" },
  ]) assert.deepEqual(restore(JSON.stringify({ ...state, ...invalid }), day), state);
  assert.deepEqual(restore(JSON.stringify(state), "2026-09-24"), createState("2026-09-24"));
  assert.deepEqual(restore("{", day), state);
});
