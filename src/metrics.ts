import { monitorEventLoopDelay, performance } from "node:perf_hooks";
export type LoopMetrics = {
  eluUtilization: number;
  lagP50Ms: number;
  lagP99Ms: number;
};

export function startLoopMetrics(intervalMs = 10_000) {
  const histogram = monitorEventLoopDelay({ resolution: 20 });

  histogram.enable();

  let lastElu = performance.eventLoopUtilization();

  let latest: LoopMetrics | null = null;
  const timer = setInterval(() => {
    const window = performance.eventLoopUtilization(lastElu);
    lastElu = performance.eventLoopUtilization();

    latest = {
      eluUtilization: window.utilization,
      lagP50Ms: histogram.percentile(50) / 1e6,
      lagP99Ms: histogram.percentile(99) / 1e6,
    };

    histogram.reset();
  }, intervalMs);
  timer.unref();

  return {
    read: (): LoopMetrics | null => latest,

    stop: () => {
      clearInterval(timer);
      histogram.disable();
    },
  };
}
