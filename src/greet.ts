import { z } from "zod";

const User = z.object({ name: z.string() });
function parseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    throw new Error("body must be valid JSON");
  }
}

export function greet(json: string): string {
  const result = User.safeParse(parseJSON(json)); // parsed once, typed unknown
  if (!result.success) {
    throw new Error("name must be a string");
  }
  return `Hello, ${result.data.name.toUpperCase()}`;
}
