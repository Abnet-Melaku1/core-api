import { randomUUID } from "node:crypto";
import http from "node:http";
import { readBody } from "./read-body.ts";
import { exceedsJsonDepth } from "./json-depth.ts";
import { greet } from "./greet.ts";
import type { IncomingMessage, ServerResponse } from "node:http"; //
import { NotFoundError, ValidationError } from "./errors.ts";

import { handleError } from "./error-handler.ts";
import type { LoopMetrics } from "./metrics.ts";
import { busyWork } from "./busy-work.ts";

type AppOptions = {
  readLoopMetrics: () => LoopMetrics | null;
  enableDebugRoutes: boolean;
};
const MAX_BODY_BYTES = 10_000;
const MAX_JSON_DEPTH = 10;
export function createApp({ readLoopMetrics, enableDebugRoutes }: AppOptions) {
  async function handleRequest(req: IncomingMessage, res: ServerResponse) {
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
      if (req.method === "POST" && req.url === "/greet") {
        const body = await readBody(req, MAX_BODY_BYTES);
        // 1. SIZE: cheapest check; throws PayloadTooLargeError (413) past the limit

        if (exceedsJsonDepth(body, MAX_JSON_DEPTH)) {
          throw new ValidationError(
            `JSON nested deeper than ${MAX_JSON_DEPTH} levels`,
          );
        }
        // 2. DEPTH: one cheap pass over the text, still no parsing (422)

        const message = greet(body);
        // 3. PARSE + VALIDATE: the expensive part, only for requests that passed 1 and 2

        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ message }));
        return;
      }

      if (
        enableDebugRoutes &&
        req.method === "GET" &&
        req.url === "/debug/block"
      ) {
        await busyWork(200); // CHANGED: inside an async function we can simply await
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("did 200 ms of work in 10 ms slices\n");
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
  }

  return http.createServer((req, res) => {
    void handleRequest(req, res);
  });
}
