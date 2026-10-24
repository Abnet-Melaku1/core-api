import { z } from "zod";

const Env = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // coerce:trun the string "6000" tointo the number 6000 first
});

export type Env = z.infer<typeof Env>;

export function loadEnv(
  source: Record<string, string | undefined> = process.env,
): Env {
  const result = Env.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables: \n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
