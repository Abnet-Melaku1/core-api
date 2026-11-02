import { test } from "node:test";
import assert from "node:assert/strict";
import {
  archive,
  complete,
  createTask,
  parseTask,
  start,
  transition,
} from "../../src/domain/task.ts";

const at = new Date("2026-01-01T00:00:00Z");
test("a draft task can be started", () => {
  const draft = createTask("t1", "Write tests");
  assert.deepEqual(transition(draft, { type: "start", at }), {
    ok: true,
    value: { id: "t1", title: "Write tests", status: "active", startedAt: at },
  });
});
test("a draft task cannot be completed", () => {
  const draft = createTask("t1", "Write tests");

  assert.deepEqual(transition(draft, { type: "complete", at }), {
    ok: false,
    error: `cannot complete a draft task`,
  });
});

test("an archived task refuses every event", () => {
  const archived = archive(
    complete(start(createTask("t1", "Write tests"), at), at),
    at,
  );

  for (const type of ["start", "complete", "archive"] as const) {
    const result = transition(archived, { type, at });
    assert.deepEqual(result, {
      ok: false,
      error: `cannot ${type} an archived task`,
    });
  }
});
test("illegal moves don't compile", () => {
  const draft = createTask("t1", "Write tests");
  // @ts-expect-error: a draft cannot be completed without being started
  complete(draft, at); // completing a DRAFT, skipping start
});
test("rejects a done task with missing dates", () => {
  const input: unknown = JSON.parse('{"id":"t1","title":"x","status":"done"}');
  const result = parseTask(input);
  assert.equal(result.ok, false);
});
test("rejects an unknown status", () => {
  const input: unknown = JSON.parse(
    '{"id":"t2","title":"y","status":"deleted"}',
  );
  const result = parseTask(input);
  assert.equal(result.ok, false);
});

test("accepts a valid done task and turns dates into Date objects", () => {
  const input: unknown = JSON.parse(
    '{"id":"t3","title":"z","status":"done","startedAt":"2026-01-01T00:00:00Z","completedAt":"2026-01-02T00:00:00Z"}',
  );
  assert.deepEqual(parseTask(input), {
    ok: true,
    value: {
      id: "t3",
      title: "z",
      status: "done",
      startedAt: new Date("2026-01-01T00:00:00Z"),
      completedAt: new Date("2026-01-02T00:00:00Z"),
    },
  });
});
