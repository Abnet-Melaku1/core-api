import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import type { Server } from "node:http";
import type { LoopMetrics } from "../src/metrics.ts";

let server: Server;
let baseUrl: string;
let fakeMetrics: LoopMetrics | null = null;
before(async () => {
  server = createApp({ readLoopMetrics: () => fakeMetrics });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("expected the server to listen on a TCP port");
  }
  baseUrl = `http://localhost:${address.port}`;
});

after(() => {
  server.close();
});

test("GET /health returns 200 and status ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("unknown routes return 404", async () => {
  const res = await fetch(`${baseUrl}/nope`);
  assert.equal(res.status, 404);
});
test("unknown routes return a problem+json 404", async () => {
  const res = await fetch(`${baseUrl}/nope`);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("content-type"), "application/problem+json");

  const body: unknown = await res.json();
  // unknown, not any: we don't trust it, we compare it
  assert.deepEqual(body, {
    type: "https://core-api.example/problems/not-found",
    title: "Resource not found",
    status: 404,
    detail: "No route for GET /nope",
    instance: "/nope",
  });
});
test("GET /metrics returns the latest loop metrics as plain text", async () => {
  fakeMetrics = { eluUtilization: 0.25, lagP50Ms: 20.43, lagP99Ms: 120 };
  // choose exact numbers, so we know exactly what the response must say

  const res = await fetch(`${baseUrl}/metrics`);

  assert.equal(res.status, 200);
  assert.ok(res.headers.get("content-type")?.startsWith("text/plain"));
  assert.equal(
    await res.text(),
    "event_loop_utilization 0.250\nevent_loop_lag_p50_ms 20.4\nevent_loop_lag_p99_ms 120.0\n",
  );
});

test("GET /metrics returns 503 before the first measurement", async () => {
  fakeMetrics = null;
  // simulate the first 10 seconds after startup

  const res = await fetch(`${baseUrl}/metrics`);

  assert.equal(res.status, 503);
  assert.equal(await res.text(), "loop metrics: no data yet\n");
});
