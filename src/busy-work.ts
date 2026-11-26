import { setImmediate as nextLap } from "node:timers/promises";

export async function busyWork(totalMs: number, sliceMs = 10): Promise<void> {
  let remaining = totalMs;

  while (remaining > 0) {
    const slice = Math.min(sliceMs, remaining);

    const start = Date.now();
    while (Date.now() - start < slice) {
      // intentional busy-wait: simulates CPU-bound work for the experiment
    }

    remaining -= slice;

    await nextLap();
  }
}
