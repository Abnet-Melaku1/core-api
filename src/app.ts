import { randomUUID } from "node:crypto";
import http from "node:http";
import { NotFoundError } from "./errors.ts";
import { toProblem } from "./problem.ts";

export function createApp() {
  return http.createServer((req, res) => {
    const requestId = `red_${randomUUID()}`;
    res.setHeader("x-request-id", requestId);

    try {
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "content-type": "application/json" });

        res.end(JSON.stringify({ status: "ok" }));
        return;
      }

      throw new NotFoundError(`No route for ${req.method} ${req.url}`);
    } catch (error) {
      const problem = toProblem(error, req.url ?? "/", requestId);
      res.writeHead(problem.status, {
        "content-type": "application/problem+json",
      });
      res.end(JSON.stringify(problem));
    }
  });
}
