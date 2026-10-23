import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;

before(async () => {
  server = createApp();
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
