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
