import type { IncomingMessage } from "node:http";
import { PayloadTooLargeError } from "./errors.ts";

export async function readBody(
  req: IncomingMessage,
  maxBytes: number,
): Promise<string> {
  const declared = Number(req.headers["content-length"] ?? 0);
  if (declared > maxBytes) {
    throw new PayloadTooLargeError(
      `Body of ${declared} bytes exceeds the ${maxBytes}-byte limit`,
    );
  }

  const chunks: Buffer[] = [];
  let received = 0;

  for await (const chunk of req) {
    received += (chunk as Buffer).length;
    if (received > maxBytes) {
      throw new PayloadTooLargeError(`Body exceeds the ${maxBytes}-byte limit`);
    }

    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}
