import { test } from "node:test";
import assert from "node:assert/strict";
import { busyWork } from "../src/busy-work.ts";

test("busyWork lets timers run while it works", async () => {
  const start = performance.now();

  const timerDelay = new Promise<number>((resolve) => {
    setTimeout(() => resolve(performance.now() - start), 0);
  });
  // a timer that should fire almost immediately; it records WHEN it actually fired

  await busyWork(200);
  const delay = await timerDelay;

  assert.ok(delay < 50, `timer was delayed ${delay.toFixed(0)} ms by busyWork`);
});
