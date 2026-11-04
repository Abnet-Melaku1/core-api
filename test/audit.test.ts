import { test } from "node:test";
import assert from "node:assert/strict";
import { completeAndAudit } from "../src/audit.ts";

test("completeAndAudit writes the audit entry before returning", async () => {
  const log: string[] = [];
  await completeAndAudit(log, "task t1 completed");
  assert.deepEqual(log, ["task t1 completed"]);
  // after it says "done", the entry must really be saved
});

test("completeAndAudit reports audit failures instead of hiding them", async () => {
  await assert.rejects(completeAndAudit([], ""), {
    message: "Failed to write audit entry",
  });
  // assert.rejects = the async version of assert.throws: the promise must FAIL with this message
});
