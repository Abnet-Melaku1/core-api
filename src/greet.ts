import { z } from "zod";
import { ValidationError } from "./errors.ts";

const User = z.object({ name: z.string() });
function parseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    throw new ValidationError("body must be valid JSON");
  }
}

export function greet(json: string): string {
  const result = User.safeParse(parseJSON(json)); // parsed once, typed unknown
  if (!result.success) {
    throw new ValidationError("name must be a string");
  }
  return `Hello, ${result.data.name.toUpperCase()}`;
}
