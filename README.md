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

| Variable | Default | Rules                   |
| -------- | ------- | ----------------------- |
| `PORT`   | `3000`  | Integer from 1 to 65535 |

## Domain: Tasks

A task moves through a fixed lifecycle, modelled as a state machine in `src/domain/task.ts`:

`draft → active → done → archived` (archived is final)

How illegal states are kept out:

- **Illegal moves don't compile.** Each state is its own type (a discriminated union on `status`), and each move only accepts the state it starts from, so `complete(draftTask)` is a type error.
- **`transition(task, event)`** applies a move when the state is only known at runtime, returning the new task or a clear error.
- **Data from outside is validated.** `parseTask()` checks JSON from requests or the database with Zod before it reaches the rules, rejecting unknown statuses and missing dates.
- **IDs can't be mixed up.** `UserId` and `TaskId` are branded types, so passing one where the other is expected is a compile error.
