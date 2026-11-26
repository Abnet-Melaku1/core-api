import { test } from "node:test";
import assert from "node:assert/strict";

import { loadEnv } from "../src/env.ts";

test("defaults PORT to 3000 when not set", () => {
  assert.equal(loadEnv({}).PORT, 3000);
});

test("converts PORT from string to number", () => {
  assert.equal(loadEnv({ PORT: "6000" }).PORT, 6000);
});

for (const bad of ["abc", "0", "70000", "300.5"]) {
  test(`rejects invalid PORT=${bad}`, () => {
    assert.throws(
      () => loadEnv({ PORT: bad }),
      /Invalid environment variables/,
    );
  });
}
test("defaults PORT to 3000 when not set", () => {
  assert.equal(loadEnv({}).PORT, 3000);
});

test("ENABLE_DEBUG_ROUTES defaults to false when not set", () => {
  const env = loadEnv({});

  assert.equal(env.ENABLE_DEBUG_ROUTES, false);
});

test("ENABLE_DEBUG_ROUTES=false stays false (not coerced to true)", () => {
  const env = loadEnv({ ENABLE_DEBUG_ROUTES: "false" });

  assert.equal(env.ENABLE_DEBUG_ROUTES, false);
  // with z.coerce.boolean() this would be true; this test guards against that trap
});

test("ENABLE_DEBUG_ROUTES=true turns debug routes on", () => {
  const env = loadEnv({ ENABLE_DEBUG_ROUTES: "true" });
  assert.equal(env.ENABLE_DEBUG_ROUTES, true);
});

test("rejects ENABLE_DEBUG_ROUTES=yes", () => {
  assert.throws(() => loadEnv({ ENABLE_DEBUG_ROUTES: "yes" }));
  // anything other than exactly "true" or "false" must stop the server at startup
});
