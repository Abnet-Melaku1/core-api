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
