import { AppError } from "./errors.ts";

type Problem = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
};

export function toProblem(
  err: unknown,
  instance: string,
  requestId: string,
): Problem {
  if (err instanceof AppError) {
    return {
      type: `https://core-api.example/problems/${err.slug}`,
      title: err.title,
      status: err.status,
      detail: err.message,
      instance: instance,
    };
  }

  return {
    type: "about:blank",
    title: "Internal Server Error",
    status: 500,
    detail: `Something went wrong. Reference: ${requestId}`,
    instance: instance,
  };
}
