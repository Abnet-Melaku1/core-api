import { z } from "zod";

const User = z.object({ name: z.string() });

export function greet(json: string): string {
  const result = User.safeParse(JSON.parse(json));
  if (!result.success) {
    throw new Error("name must be a string");
  }
  return `Hello, ${result.data.name.toUpperCase()}`;
}
