import { createApp } from "./app.ts";

import { loadEnv } from "./env.ts";

const {PORT} = loadEnv()

const server = createApp();

server.listen(PORT, () => {
  console.log(`core-api listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing server");
  server.close(() => process.exit(0));
});
