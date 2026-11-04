export async function writeAudit(log: string[], entry: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 10));

  if (entry.length === 0) {
    throw new Error("audit entry cannot be empty");
  }

  log.push(entry);
}

export async function completeAndAudit(
  log: string[],
  entry: string,
): Promise<string> {
  try {
    await writeAudit(log, entry);
  } catch (err) {
    throw new Error("Failed to write audit entry", { cause: err });
  }
  return "done";
}
