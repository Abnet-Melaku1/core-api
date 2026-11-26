# core-api

A backend API built during my 12-month backend mastery plan (Month 1: Backend Foundations).

## Requirements

- Node.js 24 (see `.node-version`)
- pnpm

## Setup

```bash
pnpm install
```

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Run the server with auto-restart on save (tsx watch) |
| `pnpm start`        | Run the server                                       |
| `pnpm typecheck`    | Type-check the project (strict TypeScript)           |
| `pnpm lint`         | Lint with ESLint (type-aware rules)                  |
| `pnpm format`       | Format all files with Prettier                       |
| `pnpm format:check` | Check formatting without changing files (used in CI) |
| `pnpm test`         | Run the tests                                        |

CI runs `typecheck`, `lint`, `format:check` and `test` on every pull request.

## Configuration

Environment variables are validated at startup. The server refuses to start if one is invalid.

| Variable              | Default | Rules                                                                             |
| --------------------- | ------- | --------------------------------------------------------------------------------- |
| `PORT`                | `3000`  | Integer from 1 to 65535                                                           |
| `ENABLE_DEBUG_ROUTES` | `false` | Exactly `true` or `false`; anything else is rejected. Never enable in production. |

## Endpoints

| Method | Path           | Description                                                                                 |
| ------ | -------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/health`      | Liveness check: `{"status":"ok"}`                                                           |
| GET    | `/metrics`     | Event loop metrics as plain text (see Observability)                                        |
| POST   | `/greet`       | `{"name":"Abnet"}` → `{"message":"Hello, ABNET"}`                                           |
| GET    | `/debug/block` | Debug only: 200 ms of CPU work in 10 ms slices. Exists only when `ENABLE_DEBUG_ROUTES=true` |

## Errors

Every error response is RFC 9457 problem details (`application/problem+json`). Every response carries an `x-request-id` header; the same ID appears in the server logs, so a failure can be traced from a client report to the exact log line. Server errors (5xx) never expose internal details to the client.

## Observability: `/metrics`

```
event_loop_utilization 0.001
event_loop_lag_p50_ms 20.1
event_loop_lag_p99_ms 20.2
```

- Values cover the last 10-second window, measured by a background timer. Reading `/metrics` never changes them.
- Returns `503` until the first window completes, rather than misleading zeros.
- Lag is sampled every 20 ms, so an idle loop reads about 20 ms. Real lag is the value above that baseline.

## Security: request limits

**Abuse case:** any client, without authentication, can send a very large or deeply nested JSON body. Buffering and synchronously parsing it holds the single event loop thread and consumes memory, so every other user's requests stall, and repeated requests can exhaust memory.

**Defence:** cheap checks run before any parsing.

| Check                                                             | Limit     | Response                |
| ----------------------------------------------------------------- | --------- | ----------------------- |
| Body size (declared `Content-Length`, then counted while reading) | 10 KB     | `413 Payload Too Large` |
| JSON nesting depth (one pass over the text)                       | 10 levels | `422`                   |
| Shape (`name` must be a string)                                   | —         | `422`                   |

## Load test: one blocking handler vs. `/health`

`autocannon -c 200 -R 2000 -d 10` against `/health`, while `/debug/block` was called about once per second. Raw output is in `evidence/`.

| `/health` | Baseline | 200 ms sync block | Fixed (10 ms slices) |
| --------- | -------- | ----------------- | -------------------- |
| p50       | 4 ms     | 38 ms             | 3 ms                 |
| p99       | 91 ms    | 181 ms            | 119 ms               |
| Max       | 98 ms    | 199 ms            | 127 ms               |

A synchronous handler sets tail latency for every endpoint. Slicing the work restores p50 and cuts p99 sharply. The remaining cost is real CPU work, which belongs in a worker thread.

## Domain: Tasks

A task moves through a fixed lifecycle, modelled as a state machine in `src/domain/task.ts`:

`draft → active → done → archived` (archived is final)

How illegal states are kept out:

- **Illegal moves don't compile.** Each state is its own type (a discriminated union on `status`), and each move only accepts the state it starts from, so `complete(draftTask)` is a type error.
- **`transition(task, event)`** applies a move when the state is only known at runtime, returning the new task or a clear error.
- **Data from outside is validated.** `parseTask()` checks JSON from requests or the database with Zod before it reaches the rules, rejecting unknown statuses and missing dates.
- **IDs can't be mixed up.** `UserId` and `TaskId` are branded types, so passing one where the other is expected is a compile error.
