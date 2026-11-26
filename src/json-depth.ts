export function exceedsJsonDepth(text: string, maxDepth: number): boolean {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (const ch of text) {
    if (inString) {
      if (escaped)
        escaped = false; // this char was escaped, e.g. \"
      else if (ch === "\\")
        escaped = true; // next char is escaped
      else if (ch === '"') inString = false; // end of the string
      continue; // brackets inside strings don't count
    }

    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") {
      depth++;
      if (depth > maxDepth) return true; // stop at the FIRST violation
    } else if (ch === "}" || ch === "]") {
      depth--;
    }
  }
  return false;
}
