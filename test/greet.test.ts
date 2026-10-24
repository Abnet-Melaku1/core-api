import { test } from "node:test";
import assert from "node:assert/strict";
import { greet } from "../src/greet.ts";
test("greets a valid user", () => {
  assert.equal(greet('{"name":"abnet"}'), "Hello, ABNET");
});

test("reject input without a name, with a clear error", () => {
  assert.throws(() => greet("{}"), { message: "name must be a string" });
});
test("rejects inputs that are not a valid user", () => {
  for (const bad of ["{}", "null", "42", '"hello"', '{"name":123}']) {
    assert.throws(
      () => greet(bad),
      { message: "name must be a string" },
      `input: ${bad}`,
    );
  }
});
