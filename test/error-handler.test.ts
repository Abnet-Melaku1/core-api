import { test } from "node:test";
import assert from "node:assert/strict";
import { handleError } from "../src/error-handler.ts";

test("internal errors are logged in full but never reach the client", () => {
  const logs: Record<string, unknown>[] = [];
  const fakeLog = (entry: Record<string, unknown>) => logs.push(entry);
  // instead of printing, collect log entries in an array we can inspect

  const sqlError = new Error('relation "tasks_v2" does not exist');
  const problem = handleError(sqlError, "/tasks", "req_42", fakeLog);

  // 1. CLIENT side: nothing internal leaks
  assert.equal(problem.status, 500);
  assert.ok(!JSON.stringify(problem).includes("tasks_v2"));
  assert.ok(!JSON.stringify(problem).includes("at "));
  // "at " appears in every stack trace line, so no stack trace either

  // 2. LOG side: the full error is there, with the same request ID
  const logged = JSON.stringify(logs);
  assert.ok(logged.includes("tasks_v2"));
  assert.ok(logged.includes("req_42"));
  assert.ok(logged.includes('"stack"'));
});
