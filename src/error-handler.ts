import { toProblem, type Problem } from "./problem.ts";
import { serializeError } from "./serialize-error.ts";

export type Log = (entry: Record<string, unknown>) => void;
export function handleError(
  err: unknown,
  instance: string,
  requestId: string,
  log: Log,
): Problem {
  const problem = toProblem(err, instance, requestId);

  log({
    level: problem.status >= 500 ? "error" : "warn",

    requestId,
    instance,
    status: problem.status,
    error: serializeError(err),
  });

  return problem;
}
