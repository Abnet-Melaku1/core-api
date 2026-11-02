import { test } from "node:test";
import assert from "assert/strict";
import { toTaskId, toUserId } from "../../src/domain/ids.ts";
import { assignTask } from "../../src/domain/assignment.ts";

test("To user id returns the right result", () => {
  const userId = toUserId("u1");

  assert.deepEqual(userId, "u1");

  assert.throws(() => toUserId(""), { message: "UserId cannot be empty" });
});
test("swapped IDs don't compile", () => {
  const userId = toUserId("u1");
  const taskId = toTaskId("t1");
  // @ts-expect-error: a UserId cannot be passed where a TaskId is expected
  assignTask(userId, taskId);
});
