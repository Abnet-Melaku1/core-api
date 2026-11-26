import { createApp } from "./app.ts";

import { startLoopMetrics } from "./metrics.ts";

import { loadEnv } from "./env.ts";

const { PORT, ENABLE_DEBUG_ROUTES } = loadEnv();

const loopMetrics = startLoopMetrics();

const server = createApp({
  readLoopMetrics: loopMetrics.read,
  enableDebugRoutes: ENABLE_DEBUG_ROUTES,
});

server.listen(PORT, () => {
  console.log(`core-api listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing server");
  server.close(() => process.exit(0));
});
