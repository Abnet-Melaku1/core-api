import { test } from "node:test";
import assert from "node:assert/strict";
import { toProblem } from "../src/problem.ts";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../src/errors.ts";

test("NotFoundError maps to 404 problem details", () => {
  assert.deepEqual(
    toProblem(
      new NotFoundError("Task t1 does not exist"),
      "/tasks/t1",
      "req_1",
    ),
    {
      type: "https://core-api.example/problems/not-found",
      title: "Resource not found",
      status: 404,
      detail: "Task t1 does not exist",
      instance: "/tasks/t1",
    },
  );
});

test("ValidationError maps to 422 problem details", () => {
  assert.deepEqual(
    toProblem(new ValidationError("name must be a string"), "/tasks", "req_1"),
    {
      type: "https://core-api.example/problems/validation",
      title: "validation failed",
      status: 422,
      detail: "name must be a string",
      instance: "/tasks",
    },
  );
});

test("ConflictError maps to 409 problem details", () => {
  assert.deepEqual(
    toProblem(new ConflictError("Email already registered"), "/users", "req_1"),
    {
      type: "https://core-api.example/problems/conflict",
      title: "Conflict",
      status: 409,
      detail: "Email already registered",
      instance: "/users",
    },
  );
});

test("UnauthorizedError maps to 401 problem details", () => {
  assert.deepEqual(
    toProblem(
      new UnauthorizedError("Missing or invalid token"),
      "/tasks",
      "req_1",
    ),
    {
      type: "https://core-api.example/problems/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Missing or invalid token",
      instance: "/tasks",
    },
  );
});

test("unknown errors map to a generic 500 without leaking details", () => {
  const problem = toProblem(
    new Error('relation "tasks_v2" does not exist'),
    "/tasks",
    "req_9",
  );

  assert.deepEqual(problem, {
    type: "about:blank",
    title: "Internal Server Error",
    status: 500,
    detail: "Something went wrong. Reference: req_9",
    instance: "/tasks",
  });
  assert.ok(!JSON.stringify(problem).includes("tasks_v2"));
  // the fake SQL table name must not appear anywhere in the response
});
