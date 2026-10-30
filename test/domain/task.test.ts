import { test } from "node:test";
import assert from "node:assert/strict";
import {
  archive,
  complete,
  createTask,
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
