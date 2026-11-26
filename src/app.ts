import { randomUUID } from "node:crypto";
import http from "node:http";
import { NotFoundError } from "./errors.ts";

import { handleError } from "./error-handler.ts";
import type { LoopMetrics } from "./metrics.ts";
import { busyWork } from "./busy-work.ts";
type AppOptions = {
  readLoopMetrics: () => LoopMetrics | null;
  enableDebugRoutes: boolean;
};
export function createApp({ readLoopMetrics, enableDebugRoutes }: AppOptions) {
  return http.createServer((req, res) => {
    const requestId = `req_${randomUUID()}`;
    res.setHeader("x-request-id", requestId);

    try {
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "content-type": "application/json" });

        res.end(JSON.stringify({ status: "ok" }));
        return;
      }
      if (req.method === "GET" && req.url === "/metrics") {
        const metrics = readLoopMetrics();

        if (metrics === null) {
          res.writeHead(503, { "content-type": "text/plain" });
          res.end("loop metrics: no data yet\n");
          return;
        }

        res.writeHead(200, { "content-type": "text/plain" });
        res.end(
          [
            `event_loop_utilization ${metrics.eluUtilization.toFixed(3)}`,
            `event_loop_lag_p50_ms ${metrics.lagP50Ms.toFixed(1)}`,
            `event_loop_lag_p99_ms ${metrics.lagP99Ms.toFixed(1)}`,
          ].join("\n") + "\n",
        );
        return;
      }
      if (
        enableDebugRoutes &&
        req.method === "GET" &&
        req.url === "/debug/block"
      ) {
        void busyWork(200).then(() => {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end("did 200 ms of work in 10 ms slices\n");
        });
        // respond when the work finishes; `void` tells the linter this promise is handled on purpose
        return;
      }
      throw new NotFoundError(`No route for ${req.method} ${req.url}`);
    } catch (error) {
      const problem = handleError(error, req.url ?? "/", requestId, (entry) => {
        console.error(JSON.stringify(entry));
      });
      res.writeHead(problem.status, {
        "content-type": "application/problem+json",
      });
      res.end(JSON.stringify(problem));
    }
  });
}
